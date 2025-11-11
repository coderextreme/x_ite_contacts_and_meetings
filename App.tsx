import React, { useState } from 'react';
import { useSpring, a } from '@react-spring/web';
import { CONTACTS, MEETINGS } from './constants';
import type { Contact, Meeting } from './types';
import { ViewType } from './types';
import Modal from './components/Modal';
import ContactForm from './components/ContactForm';
import MeetingForm from './components/MeetingForm';
import AttendeeManager from './components/AttendeeManager';
import ContactList from './components/ContactList';
import MeetingList from './components/MeetingList';
import ContactDetail from './components/ContactDetail';
import MeetingDetail from './components/MeetingDetail';
import NavButtonList from './components/NavButtonList';

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [meetings, setMeetings] = useState<Meeting[]>(MEETINGS);

  const [activeView, setActiveView] = useState<ViewType>(ViewType.CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(contacts[0]?.id || null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
  const [meetingForAttendeeMgmt, setMeetingForAttendeeMgmt] = useState<Meeting | null>(null);

  // View & Selection Handlers
  const handleViewChange = (view: ViewType) => {
    if (activeView !== view) {
      setActiveView(view);
      setSelectedContactId(null);
      setSelectedMeetingId(null);
    }
  };

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    setSelectedMeetingId(null);
    setActiveView(ViewType.CONTACTS);
  };

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setSelectedContactId(null);
    setActiveView(ViewType.MEETINGS);
  };

  // Contact Handlers
  const handleAddContact = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };
  
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (contact: Omit<Contact, 'id' | 'avatarUrl'> & { id?: string }) => {
    if (contact.id) { // Update
      setContacts(contacts.map(c => c.id === contact.id ? { ...c, ...contact } : c));
    } else { // Create
      const newContact: Contact = {
        ...contact,
        id: crypto.randomUUID(),
        avatarUrl: `https://picsum.photos/seed/${crypto.randomUUID()}/200`,
      };
      setContacts(prevContacts => [...prevContacts, newContact]);
      handleSelectContact(newContact.id);
    }
    setIsContactModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm("Are you sure you want to delete this contact? They will be removed from all meetings.")) {
        setContacts(contacts.filter(c => c.id !== contactId));
        setMeetings(meetings.map(m => ({
            ...m,
            attendees: m.attendees.filter(id => id !== contactId)
        })));
        if (selectedContactId === contactId) {
            setSelectedContactId(null);
        }
    }
  };

  // Meeting Handlers
  const handleAddMeeting = () => {
    setEditingMeeting(null);
    setIsMeetingModalOpen(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsMeetingModalOpen(true);
  };

  const handleSaveMeeting = (meeting: Omit<Meeting, 'id'> & { id?: string }) => {
     if (meeting.id) { // Update
        setMeetings(meetings.map(m => m.id === meeting.id ? { ...m, ...meeting } : m));
    } else { // Create
        const newMeeting: Meeting = {
            ...meeting,
            id: crypto.randomUUID(),
        };
        setMeetings(prevMeetings => [...prevMeetings, newMeeting]);
        handleSelectMeeting(newMeeting.id);
    }
    setIsMeetingModalOpen(false);
    setEditingMeeting(null);
  }

  const handleDeleteMeeting = (meetingId: string) => {
    if(window.confirm("Are you sure you want to delete this meeting?")) {
        setMeetings(meetings.filter(m => m.id !== meetingId));
        if (selectedMeetingId === meetingId) {
            setSelectedMeetingId(null);
        }
    }
  };

  // Attendee Management Handlers
  const handleManageAttendees = (meeting: Meeting) => {
    setMeetingForAttendeeMgmt(meeting);
    setIsAttendeeModalOpen(true);
  };

  const handleUpdateAttendees = (meetingId: string, attendeeIds: string[]) => {
    setMeetings(prevMeetings =>
      prevMeetings.map(m =>
        m.id === meetingId ? { ...m, attendees: attendeeIds } : m
      )
    );
    setIsAttendeeModalOpen(false);
    setMeetingForAttendeeMgmt(null);
  };

  const handleCloseAttendeeModal = () => {
    setIsAttendeeModalOpen(false);
    setMeetingForAttendeeMgmt(null);
  };


  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);
  const meetingContacts = selectedMeeting ? selectedMeeting.attendees.map(id => contacts.find(c => c.id === id)).filter(Boolean) as Contact[] : [];
  
  const isDetailVisible = !!(selectedContact || selectedMeeting);
  const animatedDetailProps = useSpring({
      opacity: isDetailVisible ? 1 : 0,
      transform: isDetailVisible ? 'translateX(0%)' : 'translateX(100%)',
      config: { mass: 1, tension: 220, friction: 25 }
  });

  return (
    <>
      <main className="h-full w-full flex items-center justify-center p-8 gap-8">
        {/* Nav Panel */}
        <div className="flex-shrink-0">
            <NavButtonList activeView={activeView} onSelectView={handleViewChange} />
        </div>

        {/* List Panel */}
        <div className="w-[480px] h-[800px] flex-shrink-0">
             {activeView === ViewType.CONTACTS ? (
                <ContactList
                  contacts={contacts}
                  selectedContactId={selectedContactId}
                  onSelectContact={handleSelectContact}
                  onAddContact={handleAddContact}
                />
              ) : (
                <MeetingList
                  meetings={meetings}
                  selectedMeetingId={selectedMeetingId}
                  onSelectMeeting={handleSelectMeeting}
                  onAddMeeting={handleAddMeeting}
                />
              )}
        </div>

        {/* Detail Panel */}
        <a.div className="w-[720px] h-[800px] flex-shrink-0" style={animatedDetailProps}>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full">
                {selectedContact && activeView === ViewType.CONTACTS && (
                    <ContactDetail contact={selectedContact} onEdit={handleEditContact} onDelete={handleDeleteContact} />
                )}
                {selectedMeeting && activeView === ViewType.MEETINGS && (
                    <MeetingDetail 
                        meeting={selectedMeeting} 
                        contacts={meetingContacts} 
                        onEdit={handleEditMeeting} 
                        onDelete={handleDeleteMeeting}
                        onManageAttendees={handleManageAttendees}
                    />
                )}
                {!isDetailVisible && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-lg">Select an item to see details</p>
                    </div>
                )}
            </div>
        </a.div>
      </main>

      {/* CRUD Modals */}
      <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title={editingContact ? 'Edit Contact' : 'Add Contact'}>
        <ContactForm 
            onSave={handleSaveContact} 
            onCancel={() => setIsContactModalOpen(false)}
            contact={editingContact}
        />
      </Modal>

       <Modal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} title={editingMeeting ? 'Edit Meeting' : 'Add Meeting'}>
        <MeetingForm
            onSave={handleSaveMeeting}
            onCancel={() => setIsMeetingModalOpen(false)}
            meeting={editingMeeting}
            contacts={contacts}
        />
      </Modal>
      
      {/* Attendee Management Modal */}
      {meetingForAttendeeMgmt && (
        <Modal isOpen={isAttendeeModalOpen} onClose={handleCloseAttendeeModal} title={`Manage Attendees`}>
            <AttendeeManager
                meeting={meetingForAttendeeMgmt}
                allContacts={contacts}
                onSave={handleUpdateAttendees}
                onCancel={handleCloseAttendeeModal}
            />
        </Modal>
      )}
    </>
  );
};

export default App;
