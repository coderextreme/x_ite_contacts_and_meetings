import React from 'react';
import { useSpring, a } from '@react-spring/web';
import { ViewType } from '../types';
import { UserGroupIcon, CalendarIcon } from './IconComponents';

type NavItemData = {
    view: ViewType;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    color: 'cyan' | 'purple';
};

const NavItem = ({ item, isActive, onClick }: {
    item: NavItemData;
    isActive: boolean;
    onClick: () => void;
}) => {
    const { icon: Icon, label, color } = item;

    const [spring, api] = useSpring(() => ({
        scale: 1,
        config: { mass: 1, tension: 200, friction: 20 }
    }));

    const handlePointerOver = () => api.start({ scale: 1.1 });
    const handlePointerOut = () => api.start({ scale: 1 });
    
    const activeClasses = {
      cyan: 'bg-cyan-500/30 border-cyan-400 text-cyan-200',
      purple: 'bg-purple-500/30 border-purple-400 text-purple-200',
    };
    const inactiveClasses = 'bg-gray-800/50 border-gray-700 hover:border-gray-500';
    const currentClasses = isActive ? activeClasses[color] : inactiveClasses;

    return (
        <a.div 
            style={{ 
                transform: spring.scale.to(s => `scale(${s})`),
                width: 120, 
                height: 160 
            }}
            className="cursor-pointer"
            onMouseEnter={handlePointerOver}
            onMouseLeave={handlePointerOut}
            onClick={onClick}
        >
             <div className={`w-full h-full p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-300 border-2 ${currentClasses}`}>
                <Icon className="h-12 w-12 mx-auto" />
                <span className="mt-2 text-lg font-semibold">{label}</span>
            </div>
        </a.div>
    );
};

const NAV_ITEM_HEIGHT = 160; // height of NavItem in pixels
const NAV_ITEM_GAP = 16; // gap in pixels

const NavButtonList = ({ activeView, onSelectView }: {
    activeView: ViewType;
    onSelectView: (view: ViewType) => void;
}) => {
    const navItems: NavItemData[] = [
      { view: ViewType.MEETINGS, label: 'Meetings', icon: CalendarIcon, color: 'cyan' },
      { view: ViewType.CONTACTS, label: 'Contacts', icon: UserGroupIcon, color: 'purple' }
    ];

    const activeIndex = navItems.findIndex(item => item.view === activeView);
    
    const indicatorSpring = useSpring({
        transform: `translateY(${activeIndex * (NAV_ITEM_HEIGHT + NAV_ITEM_GAP)}px)`,
        config: { mass: 1, tension: 220, friction: 25 },
    });
    
    const indicatorColor = navItems[activeIndex]?.color === 'cyan' ? '#67e8f9' : '#c084fc';

    return (
        <div className="relative p-4 bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50">
             {/* Sliding indicator */}
             <a.div 
                style={indicatorSpring}
                className="absolute top-4 left-4 w-[120px] h-[160px] rounded-lg -z-10"
             >
                <div 
                    className="w-full h-full rounded-lg"
                    style={{
                        backgroundColor: indicatorColor,
                        opacity: 0.3,
                        boxShadow: `0 0 20px 5px ${indicatorColor}`,
                    }}
                />
             </a.div>
             
            {/* Navigation Items */}
            <div className="flex flex-col items-center" style={{ gap: `${NAV_ITEM_GAP}px` }}>
                {navItems.map((item) => (
                    <NavItem 
                        key={item.view}
                        item={item}
                        isActive={activeView === item.view}
                        onClick={() => onSelectView(item.view)}
                    />
                ))}
            </div>
        </div>
    );
};

export default NavButtonList;
