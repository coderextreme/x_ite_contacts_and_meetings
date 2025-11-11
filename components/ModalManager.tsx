import React from 'react';
import { useAppStore } from '../store';
import Modal from './Modal';
import ContactForm from './ContactForm';
import MeetingForm from './MeetingForm';
import AttendeeManager from './AttendeeManager';

const ModalManager: React.FC = () => {
    const {
        isContactModalOpen, closeContactModal, editingContact,
        isMeetingModalOpen, closeMeetingModal, editingMeeting,
        isAttendeeModalOpen, closeAttendeeModal, meetingForAttendeeMgmt
    } = useAppStore();

    return (
        <>
            <Modal isOpen={isContactModalOpen} onClose={closeContactModal} title={editingContact ? 'Edit Contact' : 'Add Contact'}>
                <ContactForm />
            </Modal>

            <Modal isOpen={isMeetingModalOpen} onClose={closeMeetingModal} title={editingMeeting ? 'Edit Meeting' : 'Add Meeting'}>
                <MeetingForm />
            </Modal>
            
            {meetingForAttendeeMgmt && (
                <Modal isOpen={isAttendeeModalOpen} onClose={closeAttendeeModal} title={`Manage Attendees`}>
                    <AttendeeManager meeting={meetingForAttendeeMgmt} />
                </Modal>
            )}
        </>
    );
};

export default ModalManager;
