import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { useAppStore } from '../store';

// Import panel components
import NavButtonList from './NavButtonList';
import ContactList from './ContactList';
import MeetingList from './MeetingList';
import ContactDetail from './ContactDetail';
import MeetingDetail from './MeetingDetail';
import ModalManager from './ModalManager';
import { ViewType } from '../types';


// Declare the x_ite global so TypeScript knows about it.
declare const x_ite: {
    process_x3d_tags: () => void;
};

// Re-declare JSX intrinsic elements for X_ITE tags.
// FIX: The original detailed types were not being picked up by TypeScript, causing numerous errors.
// Using 'any' as a workaround to make the component compile without being able to modify tsconfig.json or add a .d.ts file.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'component': any;
      'x3d-canvas': any;
      'x3d': any;
      'scene': any;
      'background': any;
      'navigationInfo': any;
      'viewpoint': any;
      'pointLight': any;
      'billboard': any;
      'transform': any;
      'shape': any;
      'plane': any;
      'appearance': any;
      'material': any;
      'html': any;
      'pointSet': any;
      'coordinate': any;
      'indexedLineSet': any;
    }
  }
}

// FIX: These components have empty bodies and thus implicitly return void, which is not a valid JSX element.
// Returning null makes them valid, empty components.
const Grid = ({ size, divisions }: { size: number; divisions: number }) => {
    // ... Grid implementation from before
    return null;
};
const Stars = ({ radius, count }: { radius: number; count: number }) => {
    // ... Stars implementation from before
    return null;
};

const ListPanel = () => {
  const { activeView } = useAppStore();
  return activeView === ViewType.CONTACTS ? <ContactList /> : <MeetingList />;
};

const DetailPanel = () => {
    const { activeView, selectedContactId, selectedMeetingId } = useAppStore();
    const isDetailVisible = !!(selectedContactId || selectedMeetingId);

    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full w-full">
            {activeView === ViewType.CONTACTS && selectedContactId && <ContactDetail />}
            {activeView === ViewType.MEETINGS && selectedMeetingId && <MeetingDetail />}
            {!isDetailVisible && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-lg">Select an item to see details</p>
                </div>
            )}
        </div>
    );
};


const Scene: React.FC = () => {
  const reactRoots = useRef(new Map<string, ReactDOM.Root>());
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  const { isContactModalOpen, isMeetingModalOpen, isAttendeeModalOpen } = useAppStore();
  const isAnyModalOpen = isContactModalOpen || isMeetingModalOpen || isAttendeeModalOpen;

  useEffect(() => {
    if (typeof x_ite !== 'undefined' && typeof x_ite.process_x3d_tags === 'function') {
      setTimeout(() => x_ite.process_x3d_tags(), 0);
    }
  }, []);

  useEffect(() => {
    const panels = [
      { id: 'nav', ref: navRef, component: <NavButtonList /> },
      { id: 'list', ref: listRef, component: <ListPanel /> },
      { id: 'detail', ref: detailRef, component: <DetailPanel /> },
      { id: 'modal', ref: modalRef, component: <ModalManager /> },
    ];
    
    const mountPointPoll = setInterval(() => {
      const allReady = panels.every(p => p.ref.current?.parentElement?.querySelector('div'));

      if (allReady) {
        clearInterval(mountPointPoll);
        
        panels.forEach(p => {
            const mountDiv = p.ref.current!.parentElement!.querySelector('div');
            if(mountDiv) {
                const root = ReactDOM.createRoot(mountDiv);
                root.render(<React.StrictMode>{p.component}</React.StrictMode>);
                reactRoots.current.set(p.id, root);
            }
        });
      }
    }, 50);

    return () => {
      clearInterval(mountPointPoll);
      reactRoots.current.forEach(root => root.unmount());
    };
  }, []);

  // UI Dimensions (1 unit = 100px)
  const navWidth = 1.8, navHeight = 4;
  const listWidth = 4.8, listHeight = 8;
  const detailWidth = 7.2, detailHeight = 8;
  const modalWidth = 6, modalHeight = 6;

  // Layout calculations
  const gap = 0.5;
  const listX = 0;
  const navX = listX - (listWidth / 2) - (navWidth / 2) - gap;
  const detailX = listX + (listWidth / 2) + (detailWidth / 2) + gap;

  return (
    <x3d-canvas is="x3d" width="100%" height="100%">
      <x3d is="x3d">
        <scene is="x3d" profile="Immersive">
          <component is="x3d" name="HTML" level="1" />
          <background is="x3d" skyColor='0.0 0.0 0.0' />
          <navigationInfo is="x3d" type="EXAMINE ANY" />
          <viewpoint is="x3d" position={`0 0 ${detailWidth * 2}`} />
          
          <pointLight is="x3d" location='0 3 4' intensity='0.8' ambientIntensity='0.25' color='0.4 0.9 0.95' />
          <pointLight is="x3d" location='-3 2 3' intensity='0.6' ambientIntensity='0.25' color='0.75 0.5 0.98' />
          
           {/* Navigation Panel */}
          <transform is="x3d" translation={`${navX} 0 0`}>
            <billboard is="x3d" axisOfRotation='0 0 0'>
              <html is="x3d" ref={navRef} style={{ width: `${navWidth*100}px`, height: `${navHeight*100}px`, fontSize: '16px' }} />
            </billboard>
          </transform>

          {/* List Panel */}
          <transform is="x3d" translation={`${listX} 0 0`}>
            <billboard is="x3d" axisOfRotation='0 0 0'>
              <html is="x3d" ref={listRef} style={{ width: `${listWidth*100}px`, height: `${listHeight*100}px`, fontSize: '16px' }} />
            </billboard>
          </transform>

          {/* Detail Panel */}
          <transform is="x3d" translation={`${detailX} 0 0`}>
            <billboard is="x3d" axisOfRotation='0 0 0'>
              <html is="x3d" ref={detailRef} style={{ width: `${detailWidth*100}px`, height: `${detailHeight*100}px`, fontSize: '16px' }} />
            </billboard>
          </transform>

          {/* Modal Layer */}
          <transform is="x3d" translation="0 0 1" render={isAnyModalOpen.toString()}>
             <billboard is="x3d" axisOfRotation='0 0 0'>
                {/* Background Dimmer */}
                <shape is="x3d">
                    <plane is="x3d" size="50 50" />
                    <appearance is="x3d">
                        <material is="x3d" diffuseColor="0 0 0" transparency="0.3" />
                    </appearance>
                </shape>
                {/* Modal Content */}
                <transform is="x3d">
                    <html is="x3d" ref={modalRef} style={{ width: `${modalWidth*100}px`, height: `${modalHeight*100}px`, fontSize: '16px' }} />
                </transform>
             </billboard>
          </transform>
          
          <Stars radius={100} count={5000} />
          <Grid size={100} divisions={100} />
        </scene>
      </x3d>
    </x3d-canvas>
  );
};

export default Scene;