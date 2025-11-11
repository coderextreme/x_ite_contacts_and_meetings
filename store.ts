import { create } from 'zustand';
import type { Contact, Meeting } from './types';
import { ViewType } from './types';
import { CONTACTS, MEETINGS } from './constants';

interface AppState {
  // Data
  contacts: Contact[];
  meetings: Meeting[];

  // UI State
  activeView: ViewType;
  selectedContactId: string | null;
  selectedMeetingId: string | null;

  // Modal State
  isContactModalOpen: boolean;
  isMeetingModalOpen: boolean;
  isAttendeeModalOpen: boolean;
  editingContact: Contact | null;
  editingMeeting: Meeting | null;
  meetingForAttendeeMgmt: Meeting | null;

  // Actions
  setActiveView: (view: ViewType) => void;
  selectContact: (id: string) => void;
  selectMeeting: (id: string) => void;
  
  // Contact Actions
  openNewContactModal: () => void;
  openEditContactModal: (contact: Contact) => void;
  saveContact: (contact: Omit<Contact, 'id' | 'avatarUrl'> & { id?: string }) => void;
  deleteContact: (contactId: string) => void;
  closeContactModal: () => void;

  // Meeting Actions
  openNewMeetingModal: () => void;
  openEditMeetingModal: (meeting: Meeting) => void;
  saveMeeting: (meeting: Omit<Meeting, 'id'> & { id?: string }) => void;
  deleteMeeting: (meetingId: string) => void;
  closeMeetingModal: () => void;

  // Attendee Actions
  openAttendeeModal: (meeting: Meeting) => void;
  updateAttendees: (meetingId: string, attendeeIds: string[]) => void;
  closeAttendeeModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  contacts: CONTACTS,
  meetings: MEETINGS,
  activeView: ViewType.CONTACTS,
  selectedContactId: CONTACTS[0]?.id || null,
  selectedMeetingId: null,
  isContactModalOpen: false,
  isMeetingModalOpen: false,
  isAttendeeModalOpen: false,
  editingContact: null,
  editingMeeting: null,
  meetingForAttendeeMgmt: null,

  // --- ACTIONS ---
  setActiveView: (view) => {
    if (get().activeView !== view) {
      set({ activeView: view, selectedContactId: null, selectedMeetingId: null });
    }
  },
  selectContact: (id) => set({ selectedContactId: id, selectedMeetingId: null, activeView: ViewType.CONTACTS }),
  selectMeeting: (id) => set({ selectedMeetingId: id, selectedContactId: null, activeView: ViewType.MEETINGS }),

  // Contact Actions
  openNewContactModal: () => set({ editingContact: null, isContactModalOpen: true }),
  openEditContactModal: (contact) => set({ editingContact: contact, isContactModalOpen: true }),
  closeContactModal: () => set({ isContactModalOpen: false, editingContact: null }),
  saveContact: (contact) => {
    if (contact.id) { // Update
      set(state => ({
        contacts: state.contacts.map(c => c.id === contact.id ? { ...c, ...contact } : c)
      }));
    } else { // Create
      const newContact: Contact = {
        ...contact,
        id: crypto.randomUUID(),
        avatarUrl: `https://picsum.photos/seed/${crypto.randomUUID()}/200`,
      };
      set(state => ({ contacts: [...state.contacts, newContact] }));
      get().selectContact(newContact.id);
    }
    get().closeContactModal();
  },
  deleteContact: (contactId) => {
     if (window.confirm("Are you sure you want to delete this contact? They will be removed from all meetings.")) {
        set(state => ({
            contacts: state.contacts.filter(c => c.id !== contactId),
            meetings: state.meetings.map(m => ({
                ...m,
                attendees: m.attendees.filter(id => id !== contactId)
            })),
            selectedContactId: state.selectedContactId === contactId ? null : state.selectedContactId,
        }));
    }
  },

  // Meeting Actions
  openNewMeetingModal: () => set({ editingMeeting: null, isMeetingModalOpen: true }),
  openEditMeetingModal: (meeting) => set({ editingMeeting: meeting, isMeetingModalOpen: true }),
  closeMeetingModal: () => set({ isMeetingModalOpen: false, editingMeeting: null }),
  saveMeeting: (meeting) => {
     if (meeting.id) { // Update
        set(state => ({ meetings: state.meetings.map(m => m.id === meeting.id ? { ...m, ...meeting } as Meeting : m) }));
    } else { // Create
        const newMeeting: Meeting = {
            ...meeting,
            id: crypto.randomUUID(),
        };
        set(state => ({ meetings: [...state.meetings, newMeeting] }));
        get().selectMeeting(newMeeting.id);
    }
    get().closeMeetingModal();
  },
  deleteMeeting: (meetingId) => {
    if(window.confirm("Are you sure you want to delete this meeting?")) {
        set(state => ({
            meetings: state.meetings.filter(m => m.id !== meetingId),
            selectedMeetingId: state.selectedMeetingId === meetingId ? null : state.selectedMeetingId
        }));
    }
  },

  // Attendee Actions
  openAttendeeModal: (meeting) => set({ meetingForAttendeeMgmt: meeting, isAttendeeModalOpen: true }),
  closeAttendeeModal: () => set({ isAttendeeModalOpen: false, meetingForAttendeeMgmt: null }),
  updateAttendees: (meetingId, attendeeIds) => {
    set(state => ({
      meetings: state.meetings.map(m =>
        m.id === meetingId ? { ...m, attendees: attendeeIds } : m
      )
    }));
    get().closeAttendeeModal();
  },
}));
