import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  children: React.ReactNode;
  collapsible?: string;
  onMouseLeave?: () => void;
}

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      {children}
    </div>
  );
}

// SidebarProvider manquant pour corriger les erreurs
interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  return <div className="sidebar-provider">{children}</div>;
}

interface SidebarHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarHeader({ className, children }: SidebarHeaderProps) {
  return (
    <div className={cn("p-4 border-b", className)}>
      {children}
    </div>
  );
}

interface SidebarContentProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarContent({ className, children }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)}>
      {children}
    </div>
  );
}

interface SidebarFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarFooter({ className, children }: SidebarFooterProps) {
  return (
    <div className={cn("p-4 border-t", className)}>
      {children}
    </div>
  );
}

// Composants manquants pour corriger les erreurs
interface SidebarGroupProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarGroup({ className, children }: SidebarGroupProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  );
}

interface SidebarGroupLabelProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarGroupLabel({ className, children }: SidebarGroupLabelProps) {
  return (
    <div className={cn("px-2 py-1 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </div>
  );
}

interface SidebarGroupContentProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarGroupContent({ className, children }: SidebarGroupContentProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  );
}

interface SidebarMenuProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarMenu({ className, children }: SidebarMenuProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  );
}

interface SidebarMenuItemProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarMenuItem({ className, children }: SidebarMenuItemProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

interface SidebarRailProps {
  className?: string;
  children?: React.ReactNode;
}

export function SidebarRail({ className, children }: SidebarRailProps) {
  return (
    <div className={cn("w-1 bg-border", className)}>
      {children}
    </div>
  );
}

interface SidebarTriggerProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

export function SidebarTrigger({ className, children, onClick, onMouseEnter }: SidebarTriggerProps) {
  return (
    <button 
      className={cn("p-2 hover:bg-accent rounded-md", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </button>
  );
}

// Hook manquant pour corriger les erreurs
export function useSidebar() {
  return {
    open: true,
    setOpen: () => { /* TODO: implement */ },
    toggle: () => { /* TODO: implement */ },
    state: "open",
    toggleSidebar: () => { /* TODO: implement */ },
  };
}

// Composant manquant pour corriger les erreurs
interface SidebarMenuButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  size?: string;
  asChild?: boolean;
}

export function SidebarMenuButton({ className, children, onClick, size: _size, asChild: _asChild }: SidebarMenuButtonProps) {
  return (
    <button 
      className={cn("w-full text-left p-2 hover:bg-accent rounded-md", className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}