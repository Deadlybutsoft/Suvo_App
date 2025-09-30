import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, CreditCardIcon, SettingsIcon, EllipsisVerticalIcon, PlusIcon, PencilIcon, LinkIcon, TrashIcon } from './icons/index';
import { SettingsTab, Project } from '../types';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab?: SettingsTab) => void;
  onUpgradeClick: () => void;
  projects: Project[];
  activeProjectId: number | null;
  onCreateNewProject: (name: string) => void;
  onDeleteProject: (id: number) => void;
  onRenameProject: (id: number, newName: string) => void;
  onSwitchProject: (id: number) => void;
}

const NavLink: React.FC<{ onClick?: () => void; href?: string; children: React.ReactNode; icon: React.FC<{ className?: string }>; }> = ({ onClick, href, children, icon: Icon }) => {
    const commonProps = {
        className: "group flex items-center gap-3.5 w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-900 transition-colors"
    };
    const content = <>
        <Icon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
        <span className="font-medium text-zinc-300">{children}</span>
    </>;
    return href ? <a href={href} {...commonProps}>{content}</a> : <button onClick={onClick} {...commonProps}>{content}</button>;
};

export const SideDrawer: React.FC<SideDrawerProps> = ({ 
    isOpen, onClose, onOpenSettings, onUpgradeClick,
    projects, activeProjectId, onCreateNewProject, onDeleteProject, onRenameProject, onSwitchProject,
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [newProjectNameForRename, setNewProjectNameForRename] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    onDeleteProject(projectToDelete.id);
    setProjectToDelete(null);
  };

  const handleConfirmCreate = () => {
    const finalName = newProjectName.trim().replace(/\s/g, '');
    if (finalName) {
        onCreateNewProject(finalName);
        setNewProjectName('');
        setIsCreatingProject(false);
    }
  };

  const handleConfirmRename = () => {
    const finalName = newProjectNameForRename.trim().replace(/\s/g, '');
    if (projectToRename && finalName) {
      onRenameProject(projectToRename.id, finalName);
      setProjectToRename(null);
      setNewProjectNameForRename("");
    }
  };
  
  const handleShareProject = (project: Project) => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        setToastMessage(`Link for "${project.name}" copied!`);
        setTimeout(() => setToastMessage(null), 3000);
    }, (err) => {
        console.error('Could not copy text: ', err);
        setToastMessage(`Failed to copy link.`);
        setTimeout(() => setToastMessage(null), 3000);
    });
    setOpenMenuId(null);
  };

  const handleSettingsClick = () => {
      onClose();
      onOpenSettings();
  }
  
  const handleSubscriptionClick = () => {
      onClose();
      onOpenSettings('subscription');
  }

  return (
    <>
      {/* Modals and Toasts */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 shadow-xl w-full max-w-md rounded-lg">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-white">Delete Project</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                        Are you sure you want to delete "{projectToDelete.name}"? This action cannot be undone.
                    </p>
                </div>
                <div className="px-6 py-4 bg-black/30 flex justify-end gap-3 border-t border-zinc-800">
                    <button onClick={() => setProjectToDelete(null)} className="px-4 py-2 text-sm font-semibold text-zinc-300 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">Cancel</button>
                    <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">Delete Project</button>
                </div>
            </div>
        </div>
      )}
      {projectToRename && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 shadow-xl w-full max-w-md rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">Rename Project</h3>
              <p className="mt-1 text-sm text-zinc-400">Enter a new name for the project "{projectToRename.name}".</p>
              <input
                type="text"
                value={newProjectNameForRename}
                onChange={e => setNewProjectNameForRename(e.target.value.replace(/\s/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleConfirmRename()}
                className="mt-4 w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-white/50 outline-none transition"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-black/30 flex justify-end gap-3 border-t border-zinc-800">
              <button onClick={() => setProjectToRename(null)} className="px-4 py-2 text-sm font-semibold text-zinc-300 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={handleConfirmRename} disabled={!newProjectNameForRename.trim()} className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors">Rename</button>
            </div>
          </div>
        </div>
      )}
      {toastMessage && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">{toastMessage}</div>}

      {/* Drawer */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-80 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full text-white">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0 h-16">
            <h1 className="text-2xl font-bold text-white select-none font-logo">Suvo</h1>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors"><CloseIcon className="h-5 w-5" /></button>
          </div>
          
          <div className="flex-1 flex flex-col gap-8 py-5 px-4 overflow-y-auto">
            {/* Project Section */}
            <div>
                {isCreatingProject ? (
                    <div className="space-y-3 p-2 bg-zinc-900 rounded-lg">
                        <input type="text" placeholder="Project name..." value={newProjectName} onChange={e => setNewProjectName(e.target.value.replace(/\s/g, ''))} onKeyDown={e => e.key === 'Enter' && handleConfirmCreate()} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white/50 outline-none transition" autoFocus />
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setIsCreatingProject(false)} className="px-3 py-1.5 text-sm font-medium text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors">Cancel</button>
                            <button onClick={handleConfirmCreate} disabled={!newProjectName.trim()} className="px-3 py-1.5 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors">Create</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsCreatingProject(true)} className="flex items-center justify-center gap-2 w-full p-2.5 bg-zinc-900 text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors font-medium border border-zinc-800 hover:border-zinc-700">
                        <PlusIcon className="w-4 h-4" />
                        New Project
                    </button>
                )}
            </div>

            <div className="flex-1">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">Projects</h3>
              {projects.length > 0 ? (
                <ul className="space-y-1">
                    {projects.map((project) => (
                        <li key={project.id}>
                           <div className="group relative">
                               <button onClick={() => onSwitchProject(project.id)} className={`w-full text-left p-3 pr-10 rounded-lg transition-colors font-medium truncate flex items-center gap-3 ${project.id === activeProjectId ? 'bg-zinc-800/60 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}>
                                   {project.name}
                               </button>
                               <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)} className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                                       <EllipsisVerticalIcon className="w-5 h-5" />
                                   </button>
                               </div>

                               {openMenuId === project.id && (
                                   <div ref={menuRef} className="absolute top-full right-2 mt-1 w-48 bg-zinc-900 border border-zinc-800 shadow-2xl z-10 p-1.5 rounded-lg">
                                       <button onClick={() => { setProjectToRename(project); setNewProjectNameForRename(project.name); setOpenMenuId(null); }} className="flex items-center gap-3 w-full text-left text-sm px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors">
                                          <PencilIcon className="w-4 h-4" /> Rename
                                       </button>
                                       <button onClick={() => handleShareProject(project)} className="flex items-center gap-3 w-full text-left text-sm px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors">
                                          <LinkIcon className="w-4 h-4" /> Share
                                       </button>
                                       <div className="my-1.5 h-px bg-zinc-800"></div>
                                       <button onClick={() => { setProjectToDelete(project); setOpenMenuId(null); }} disabled={projects.length <= 1} className="flex items-center gap-3 w-full text-left text-sm px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md disabled:text-zinc-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
                                          <TrashIcon className="w-4 h-4" /> Delete
                                       </button>
                                   </div>
                               )}
                           </div>
                        </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 px-3 py-2 text-center">No projects yet.</p>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 p-4 border-t border-zinc-800">
            <div className="space-y-1">
                <NavLink onClick={handleSubscriptionClick} icon={CreditCardIcon}>My Subscription</NavLink>
                <NavLink onClick={handleSettingsClick} icon={SettingsIcon}>Settings</NavLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};