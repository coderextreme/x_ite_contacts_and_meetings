import { CONTACTS, MEETINGS } from './constants.js';
import { ViewType, Recurrence } from './types.js';
import * as Icons from './components/IconComponents.js';
import { generateMeetingBriefing } from './services/geminiService.js';

// --- STATE MANAGEMENT ---
const appState = {
  contacts: [...CONTACTS],
  meetings: [...MEETINGS],
  activeView: ViewType.CONTACTS,
  selectedContactId: CONTACTS[0]?.id || null,
  selectedMeetingId: null,
  
  // Modal State
  modal: {
    isOpen: false,
    type: null, // 'contactForm' | 'meetingForm' | 'attendeeManager'
    data: null, // editingContact, editingMeeting, or meetingForAttendeeMgmt
  },
};

// --- DOM CONTAINERS ---
let navContainer, listContainer, detailContainer, modalContainer, modalLayer;

document.addEventListener('DOMContentLoaded', () => {
    navContainer = document.getElementById('nav-container');
    listContainer = document.getElementById('list-container');
    detailContainer = document.getElementById('detail-container');
    modalContainer = document.getElementById('modal-container');
    modalLayer = document.getElementById('modal-layer');
    
    if (navContainer && listContainer && detailContainer && modalContainer && modalLayer) {
        initApp();
    } else {
        console.error("One or more container elements not found!");
    }
});


function initApp() {
    renderAll();
}

function setState(newState) {
    Object.assign(appState, newState);
    renderAll();
}

// --- RENDER FUNCTIONS ---
function renderAll() {
    renderNav();
    renderList();
    renderDetail();
    renderModal();
    updateModalVisibility();
}

function renderNav() {
    const { activeView } = appState;
    const navItems = [
      { view: ViewType.MEETINGS, label: 'Meetings', icon: Icons.CalendarIcon(), color: 'cyan' },
      { view: ViewType.CONTACTS, label: 'Contacts', icon: Icons.UserGroupIcon(), color: 'purple' }
    ];

    navContainer.innerHTML = `
        <div class="relative p-4 bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 h-full flex flex-col items-center justify-center gap-4">
            ${navItems.map(item => `
                <div 
                    class="w-[120px] h-[160px] p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-300 border-2 cursor-pointer
                    ${activeView === item.view 
                        ? `bg-${item.color}-500/30 border-${item.color}-400 text-${item.color}-200 shadow-lg shadow-${item.color}-500/20`
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'}"
                    data-view="${item.view}"
                >
                    <div class="h-12 w-12 mx-auto">${item.icon}</div>
                    <span class="mt-2 text-lg font-semibold">${item.label}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    navContainer.querySelectorAll('[data-view]').forEach(el => {
        el.addEventListener('click', () => {
             const view = el.dataset.view;
             if (appState.activeView !== view) {
                setState({ activeView: view, selectedContactId: null, selectedMeetingId: null });
             }
        });
    });
}

function renderList() {
    if (appState.activeView === ViewType.CONTACTS) {
        renderContactList();
    } else {
        renderMeetingList();
    }
}

function renderContactList() {
    const { contacts, selectedContactId } = appState;
    listContainer.innerHTML = `
        <div class="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 flex flex-col h-full overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-700/80 flex-shrink-0">
                <h2 class="text-2xl font-bold text-purple-300">Contacts</h2>
                <button id="add-contact-btn" class="p-2 rounded-full text-purple-300 bg-purple-500/20 hover:bg-purple-500/40 transition-colors" aria-label="Add new contact">
                    ${Icons.PlusIcon({className: "h-6 w-6"})}
                </button>
            </div>
            <div class="p-4 space-y-3 overflow-y-auto custom-scrollbar">
                ${contacts.map(contact => `
                    <div class="w-full text-left p-3 rounded-lg transition-all duration-200 border-2 cursor-pointer 
                        ${selectedContactId === contact.id
                            ? 'bg-purple-500/30 border-purple-400 shadow-lg shadow-purple-500/20'
                            : 'bg-gray-800/50 border-transparent hover:bg-purple-500/10 hover:border-purple-600/50'}"
                        data-contact-id="${contact.id}"
                    >
                        <div class="flex items-center space-x-4">
                            <img src="${contact.avatarUrl}" alt="${contact.name}" class="h-12 w-12 rounded-full border-2 border-purple-400/50" />
                            <div>
                                <p class="font-semibold text-white">${contact.name}</p>
                                <p class="text-sm text-gray-400">${contact.title}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('add-contact-btn').addEventListener('click', openNewContactModal);
    listContainer.querySelectorAll('[data-contact-id]').forEach(el => {
        el.addEventListener('click', () => {
            setState({ selectedContactId: el.dataset.contactId, selectedMeetingId: null, activeView: ViewType.CONTACTS });
        });
    });
}

function renderMeetingList() {
    const { meetings, selectedMeetingId } = appState;
    const formatDate = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
    
    listContainer.innerHTML = `
         <div class="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 flex flex-col h-full overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-700/80 flex-shrink-0">
                <h2 class="text-2xl font-bold text-cyan-300">Meetings</h2>
                 <button id="add-meeting-btn" class="p-2 rounded-full text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors" aria-label="Add new meeting">
                    ${Icons.PlusIcon({className: "h-6 w-6"})}
                </button>
            </div>
            <div class="p-4 space-y-3 overflow-y-auto custom-scrollbar">
            ${meetings.map(meeting => `
                <div class="w-full text-left p-3 rounded-lg transition-all duration-200 border-2 cursor-pointer ${
                    selectedMeetingId === meeting.id
                    ? 'bg-cyan-500/30 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-gray-800/50 border-transparent hover:bg-cyan-500/10 hover:border-cyan-600/50'
                }" data-meeting-id="${meeting.id}">
                    <p class="font-semibold text-white">${meeting.title}</p>
                    <div class="flex items-center text-sm text-gray-400 mt-1">
                        ${Icons.ClockIcon({className: "h-4 w-4 mr-2"})}
                        <span>${formatDate(meeting.time)}</span>
                    </div>
                </div>
            `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('add-meeting-btn').addEventListener('click', openNewMeetingModal);
    listContainer.querySelectorAll('[data-meeting-id]').forEach(el => {
        el.addEventListener('click', () => {
            setState({ selectedMeetingId: el.dataset.meetingId, selectedContactId: null, activeView: ViewType.MEETINGS });
        });
    });
}

function renderDetail() {
    const { activeView, selectedContactId, selectedMeetingId } = appState;
    const isDetailVisible = !!(selectedContactId || selectedMeetingId);

    let content = `<div class="flex items-center justify-center h-full"><p class="text-gray-400 text-lg">Select an item to see details</p></div>`;
    
    if (activeView === ViewType.CONTACTS && selectedContactId) {
        content = renderContactDetail();
    } else if (activeView === ViewType.MEETINGS && selectedMeetingId) {
        content = renderMeetingDetail();
    }
    
    detailContainer.innerHTML = `<div class="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full w-full">${content}</div>`;
    
    // Add event listeners for buttons inside the detail panel
    if (activeView === ViewType.CONTACTS && selectedContactId) {
        document.getElementById('edit-contact-btn')?.addEventListener('click', () => openEditContactModal(appState.contacts.find(c => c.id === selectedContactId)));
        document.getElementById('delete-contact-btn')?.addEventListener('click', () => deleteContact(selectedContactId));
    }
    if (activeView === ViewType.MEETINGS && selectedMeetingId) {
        const meeting = appState.meetings.find(m => m.id === selectedMeetingId);
        document.getElementById('edit-meeting-btn')?.addEventListener('click', () => openEditMeetingModal(meeting));
        document.getElementById('delete-meeting-btn')?.addEventListener('click', () => deleteMeeting(selectedMeetingId));
        document.getElementById('manage-attendees-btn')?.addEventListener('click', () => openAttendeeModal(meeting));
        document.getElementById('generate-briefing-btn')?.addEventListener('click', handleGenerateBriefing);
    }
}

function renderContactDetail() {
    const contact = appState.contacts.find(c => c.id === appState.selectedContactId);
    if (!contact) return '';

    return `
        <div class="flex flex-col items-center text-center p-4 h-full animate-fade-in">
          <img src="${contact.avatarUrl}" alt="${contact.name}" class="h-40 w-40 rounded-full border-4 border-purple-400 shadow-lg shadow-purple-500/20 mb-6" />
          <h1 class="text-4xl font-bold text-white tracking-wider">${contact.name}</h1>
          <p class="text-xl text-purple-300 mt-1">${contact.title}</p>
          <div class="flex gap-4 mt-4">
              <button id="edit-contact-btn" class="p-3 rounded-full bg-gray-700 hover:bg-purple-500/40 text-purple-300 transition-colors" aria-label="Edit contact">
                ${Icons.PencilIcon({className: "h-6 w-6"})}
              </button>
              <button id="delete-contact-btn" class="p-3 rounded-full bg-gray-700 hover:bg-red-500/40 text-red-300 transition-colors" aria-label="Delete contact">
                ${Icons.TrashIcon({className: "h-6 w-6"})}
              </button>
          </div>
          <div class="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700 w-full max-w-md">
            <div class="space-y-4 text-left">
              <div class="flex items-center">
                ${Icons.BriefcaseIcon({className: "h-6 w-6 text-purple-400 mr-4"})}
                <span class="text-gray-300">${contact.company}</span>
              </div>
              <div class="flex items-center">
                ${Icons.MailIcon({className: "h-6 w-6 text-purple-400 mr-4"})}
                <a href="mailto:${contact.email}" class="text-gray-300 hover:text-purple-300 transition-colors">${contact.email}</a>
              </div>
              <div class="flex items-center">
                ${Icons.PhoneIcon({className: "h-6 w-6 text-purple-400 mr-4"})}
                <a href="tel:${contact.phone}" class="text-gray-300 hover:text-purple-300 transition-colors">${contact.phone}</a>
              </div>
            </div>
          </div>
        </div>
    `;
}

function renderMeetingDetail(briefingData = null, isLoading = false, error = null) {
    const meeting = appState.meetings.find(m => m.id === appState.selectedMeetingId);
    if (!meeting) return '';
    const meetingContacts = meeting.attendees.map(id => appState.contacts.find(c => c.id === id)).filter(Boolean);
    const formatDate = (date) => new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
    
    let briefingContent = '';
    if (isLoading) {
        briefingContent = `<div class="flex justify-center items-center h-full">${Icons.LoadingSpinner()}</div>`;
    } else if (error) {
        briefingContent = `<p class="text-red-400">${error}</p>`;
    } else if (briefingData) {
        briefingContent = `
            <div class="space-y-4 text-sm animate-fade-in">
                <div>
                    <h3 class="font-bold text-gray-200">Summary</h3>
                    <p class="text-gray-400">${briefingData.summary}</p>
                </div>
                <div>
                    <h3 class="font-bold text-gray-200">Attendee Insights</h3>
                    <ul class="list-disc list-inside space-y-2 pl-2 mt-1">
                        ${briefingData.attendeeBriefings.map(ab => `
                            <li class="text-gray-400"><strong class="text-gray-300">${ab.name}:</strong> ${ab.brief}</li>
                        `).join('')}
                    </ul>
                </div>
                 <div>
                    <h3 class="font-bold text-gray-200">Key Talking Points</h3>
                    <ul class="list-disc list-inside space-y-1 pl-2 mt-1">
                        ${briefingData.talkingPoints.map(tp => `<li class="text-gray-400">${tp}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    return `
        <div class="animate-fade-in h-full flex flex-col gap-4">
          <div>
            <div class="flex justify-between items-start">
                <h1 class="text-4xl font-bold text-white tracking-wider">${meeting.title}</h1>
                <div class="flex gap-2 flex-shrink-0 ml-4">
                     <button id="edit-meeting-btn" class="p-3 rounded-full bg-gray-700 hover:bg-cyan-500/40 text-cyan-300 transition-colors" aria-label="Edit meeting">${Icons.PencilIcon({className:"h-6 w-6"})}</button>
                    <button id="delete-meeting-btn" class="p-3 rounded-full bg-gray-700 hover:bg-red-500/40 text-red-300 transition-colors" aria-label="Delete meeting">${Icons.TrashIcon({className:"h-6 w-6"})}</button>
                </div>
            </div>
            <div class="flex items-center text-cyan-300 mt-2 space-x-4">
                <div class="flex items-center">${Icons.ClockIcon({className:"h-5 w-5 mr-2"})} <span>${formatDate(meeting.time)} (${meeting.duration} min)</span></div>
                 ${meeting.recurrence && meeting.recurrence !== 'Does not repeat' ? `<div class="flex items-center">${Icons.CalendarDaysIcon({className:"h-5 w-5 mr-2"})} <span>${meeting.recurrence}</span></div>` : ''}
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0">
              <div class="bg-gray-900/50 p-4 rounded-lg border border-gray-700 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                <div>
                  <h2 class="text-xl font-semibold text-gray-300">Agenda</h2>
                  <p class="text-gray-400 whitespace-pre-wrap mt-2">${meeting.agenda}</p>
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-300 flex justify-between items-center">
                    <span>Attendees</span>
                    <button id="manage-attendees-btn" class="flex items-center text-sm text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1 rounded-md transition-colors" aria-label="Manage attendees">${Icons.UserPlusIcon({className:"h-5 w-5 mr-2"})} Manage</button>
                  </h2>
                  <div class="flex flex-wrap gap-4 mt-2">
                  ${meetingContacts.map(contact => `
                      <div class="flex items-center space-x-2">
                          <img src="${contact.avatarUrl}" alt="${contact.name}" class="h-10 w-10 rounded-full" />
                          <div>
                              <p class="text-sm font-medium text-white">${contact.name}</p>
                              <p class="text-xs text-gray-400">${contact.title}</p>
                          </div>
                      </div>
                  `).join('')}
                  ${meetingContacts.length === 0 ? `<p class="text-gray-500">No attendees assigned.</p>` : ''}
                  </div>
                </div>
              </div>
              <div class="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-semibold text-cyan-300 flex items-center">${Icons.SparklesIcon({className:"h-6 w-6 mr-2"})} AI Briefing</h2>
                    <button id="generate-briefing-btn" ${isLoading ? 'disabled' : ''} class="flex items-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex-shrink-0">
                        ${isLoading ? Icons.LoadingSpinner() : Icons.SparklesIcon({className:"h-5 w-5 mr-2"})}
                        ${isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                <div id="briefing-output" class="flex-grow overflow-y-auto custom-scrollbar pr-2">${briefingContent}</div>
              </div>
          </div>
        </div>
    `;
}

async function handleGenerateBriefing() {
    const meeting = appState.meetings.find(m => m.id === appState.selectedMeetingId);
    if (!meeting) return;
    
    const meetingContacts = meeting.attendees.map(id => appState.contacts.find(c => c.id === id)).filter(Boolean);
    
    // Re-render detail view with loading state
    detailContainer.innerHTML = `<div class="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full w-full">${renderMeetingDetail(null, true, null)}</div>`;
    document.getElementById('generate-briefing-btn')?.addEventListener('click', handleGenerateBriefing); // Re-attach listener
    
    try {
      const result = await generateMeetingBriefing(meeting, meetingContacts);
       detailContainer.innerHTML = `<div class="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full w-full">${renderMeetingDetail(result, false, null)}</div>`;
    } catch (e) {
      console.error(e);
      detailContainer.innerHTML = `<div class="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full w-full">${renderMeetingDetail(null, false, 'Failed to generate briefing. Please try again.')}</div>`;
    } finally {
        // Re-attach all listeners for the detail view
        const updatedMeeting = appState.meetings.find(m => m.id === appState.selectedMeetingId);
        document.getElementById('edit-meeting-btn')?.addEventListener('click', () => openEditMeetingModal(updatedMeeting));
        document.getElementById('delete-meeting-btn')?.addEventListener('click', () => deleteMeeting(appState.selectedMeetingId));
        document.getElementById('manage-attendees-btn')?.addEventListener('click', () => openAttendeeModal(updatedMeeting));
        document.getElementById('generate-briefing-btn')?.addEventListener('click', handleGenerateBriefing);
    }
}


function renderModal() {
    const { modal } = appState;
    if (!modal.isOpen) {
        modalContainer.innerHTML = '';
        return;
    }

    let title = '';
    let formContent = '';

    if (modal.type === 'contactForm') {
        title = modal.data ? 'Edit Contact' : 'Add Contact';
        formContent = renderContactForm(modal.data);
    } else if (modal.type === 'meetingForm') {
        title = modal.data ? 'Edit Meeting' : 'Add Meeting';
        formContent = renderMeetingForm(modal.data);
    } else if (modal.type === 'attendeeManager') {
        title = `Manage Attendees`;
        formContent = renderAttendeeManager(modal.data);
    }
    
    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="modal-backdrop">
        <div class="bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl shadow-cyan-500/10 w-full max-w-lg text-gray-200">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 class="text-xl font-bold">${title}</h2>
              <button id="close-modal-btn" class="p-1 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close modal">
                ${Icons.XMarkIcon({className: "h-6 w-6"})}
              </button>
            </div>
            <div class="p-6">${formContent}</div>
        </div>
      </div>
    `;
    
    // Add event listeners for modal
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);
    modalContainer.querySelector('.bg-gray-800').addEventListener('click', e => e.stopPropagation());
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-btn')?.addEventListener('click', closeModal);

    const form = modalContainer.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    const saveAttendeesBtn = document.getElementById('save-attendees-btn');
    if (saveAttendeesBtn) {
        saveAttendeesBtn.addEventListener('click', handleAttendeeSave);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (appState.modal.type === 'contactForm') {
        saveContact({
            ...data,
            id: appState.modal.data?.id,
        });
    } else if (appState.modal.type === 'meetingForm') {
        const attendees = formData.getAll('attendees');
        saveMeeting({
            ...data,
            id: appState.modal.data?.id,
            time: new Date(data.time),
            duration: parseInt(data.duration, 10),
            attendees,
        });
    }
}

function renderContactForm(contact) {
    const c = contact || {};
    return `
        <form class="space-y-4">
            <input type="text" name="name" placeholder="Full Name" required value="${c.name || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition">
            <input type="text" name="title" placeholder="Title" required value="${c.title || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition">
            <input type="text" name="company" placeholder="Company" required value="${c.company || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition">
            <input type="email" name="email" placeholder="Email" required value="${c.email || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition">
            <input type="tel" name="phone" placeholder="Phone" required value="${c.phone || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition">
            <div class="flex justify-end gap-4 pt-4">
                <button type="button" id="cancel-btn" class="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" class="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 transition-colors text-white font-semibold">Save Contact</button>
            </div>
        </form>
    `;
}

function renderMeetingForm(meeting) {
    const m = meeting || {};
    const timeForInput = m.time ? new Date(m.time.getTime() - (m.time.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
    return `
        <form class="space-y-4">
            <input type="text" name="title" placeholder="Title" required value="${m.title || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition">
            <div class="grid grid-cols-2 gap-4">
                <input type="datetime-local" name="time" required value="${timeForInput}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition">
                <input type="number" name="duration" placeholder="Duration (min)" required min="1" value="${m.duration || 60}" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition">
            </div>
            <select name="recurrence" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition">
                ${Object.values(Recurrence).map(r => `<option value="${r}" ${m.recurrence === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
            <textarea name="agenda" placeholder="Agenda" required rows="3" class="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition">${m.agenda || ''}</textarea>
            <div>
                 <label class="block text-sm font-medium text-gray-400 mb-1">Attendees</label>
                 <div class="max-h-40 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md p-2 space-y-2 custom-scrollbar">
                    ${appState.contacts.map(contact => `
                        <div class="flex items-center">
                            <input type="checkbox" name="attendees" value="${contact.id}" id="contact-${contact.id}" ${m.attendees?.includes(contact.id) ? 'checked' : ''} class="h-4 w-4 rounded border-gray-500 bg-gray-800 text-cyan-600 focus:ring-cyan-500">
                            <label for="contact-${contact.id}" class="ml-3 text-sm text-gray-300">${contact.name}</label>
                        </div>
                    `).join('')}
                 </div>
            </div>
            <div class="flex justify-end gap-4 pt-4">
                <button type="button" id="cancel-btn" class="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" class="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 transition-colors text-white font-semibold">Save Meeting</button>
            </div>
        </form>
    `;
}

function renderAttendeeManager(meeting) {
    return `
        <div class="space-y-4">
            <p class="text-gray-400">Select contacts to invite to "${meeting.title}".</p>
            <div id="attendee-list" class="max-h-64 overflow-y-auto bg-gray-900/50 border border-gray-700 rounded-md p-3 space-y-2 custom-scrollbar">
                ${appState.contacts.map(contact => `
                    <div class="flex items-center p-2 rounded-md hover:bg-gray-700/50 transition-colors">
                        <input type="checkbox" name="attendees" value="${contact.id}" id="attendee-${contact.id}" ${meeting.attendees.includes(contact.id) ? 'checked' : ''} class="h-5 w-5 rounded border-gray-500 bg-gray-800 text-cyan-600 focus:ring-cyan-500 cursor-pointer">
                        <label for="attendee-${contact.id}" class="ml-3 flex items-center space-x-3 cursor-pointer flex-grow">
                             <img src="${contact.avatarUrl}" alt="${contact.name}" class="h-10 w-10 rounded-full" />
                             <div>
                                <span class="text-gray-200 font-medium">${contact.name}</span>
                                <p class="text-xs text-gray-400">${contact.title}</p>
                            </div>
                        </label>
                    </div>
                `).join('')}
                ${appState.contacts.length === 0 ? `<p class="text-gray-500 text-center p-4">No contacts available to add.</p>` : ''}
            </div>
            <div class="flex justify-end gap-4 pt-4">
                <button type="button" id="cancel-btn" class="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="button" id="save-attendees-btn" class="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 transition-colors text-white font-semibold">Update Attendees</button>
            </div>
        </div>
    `;
}

function handleAttendeeSave() {
    const meetingId = appState.modal.data.id;
    const selectedIds = Array.from(modalContainer.querySelectorAll('#attendee-list input:checked')).map(el => el.value);
    updateAttendees(meetingId, selectedIds);
}

function updateModalVisibility() {
    modalLayer.setAttribute('render', appState.modal.isOpen.toString());
}


// --- ACTIONS ---
function openNewContactModal() {
    setState({ modal: { isOpen: true, type: 'contactForm', data: null } });
}
function openEditContactModal(contact) {
    setState({ modal: { isOpen: true, type: 'contactForm', data: contact } });
}
function openNewMeetingModal() {
    setState({ modal: { isOpen: true, type: 'meetingForm', data: null } });
}
function openEditMeetingModal(meeting) {
    setState({ modal: { isOpen: true, type: 'meetingForm', data: meeting } });
}
function openAttendeeModal(meeting) {
    setState({ modal: { isOpen: true, type: 'attendeeManager', data: meeting } });
}
function closeModal() {
    setState({ modal: { isOpen: false, type: null, data: null } });
}

function saveContact(contactData) {
    let newContacts;
    let newSelectedId = appState.selectedContactId;
    if (contactData.id) { // Update
        newContacts = appState.contacts.map(c => c.id === contactData.id ? { ...c, ...contactData } : c);
    } else { // Create
        const newContact = {
            ...contactData,
            id: crypto.randomUUID(),
            avatarUrl: `https://picsum.photos/seed/${crypto.randomUUID()}/200`,
        };
        newContacts = [...appState.contacts, newContact];
        newSelectedId = newContact.id;
    }
    closeModal();
    setState({ contacts: newContacts, selectedContactId: newSelectedId });
}

function deleteContact(contactId) {
    if (window.confirm("Are you sure you want to delete this contact? They will be removed from all meetings.")) {
        const newContacts = appState.contacts.filter(c => c.id !== contactId);
        const newMeetings = appState.meetings.map(m => ({
            ...m,
            attendees: m.attendees.filter(id => id !== contactId)
        }));
        const newSelectedId = appState.selectedContactId === contactId ? null : appState.selectedContactId;
        setState({ contacts: newContacts, meetings: newMeetings, selectedContactId: newSelectedId });
    }
}

function saveMeeting(meetingData) {
    let newMeetings;
    let newSelectedId = appState.selectedMeetingId;
    if (meetingData.id) { // Update
        newMeetings = appState.meetings.map(m => m.id === meetingData.id ? { ...m, ...meetingData } : m);
    } else { // Create
        const newMeeting = {
            ...meetingData,
            id: crypto.randomUUID(),
        };
        newMeetings = [...appState.meetings, newMeeting];
        newSelectedId = newMeeting.id;
    }
    closeModal();
    setState({ meetings: newMeetings, selectedMeetingId: newSelectedId });
}

function deleteMeeting(meetingId) {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
        const newMeetings = appState.meetings.filter(m => m.id !== meetingId);
        const newSelectedId = appState.selectedMeetingId === meetingId ? null : appState.selectedMeetingId;
        setState({ meetings: newMeetings, selectedMeetingId: newSelectedId });
    }
}

function updateAttendees(meetingId, attendeeIds) {
    const newMeetings = appState.meetings.map(m =>
        m.id === meetingId ? { ...m, attendees: attendeeIds } : m
    );
    closeModal();
    setState({ meetings: newMeetings });
}
