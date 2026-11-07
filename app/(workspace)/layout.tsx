'use client';
import { SessionProvider } from 'next-auth/react';
import WorkspaceShell from '@/components/workspace-shell';
export default function Layout({children}:{children:React.ReactNode}){return <SessionProvider><WorkspaceShell>{children}</WorkspaceShell></SessionProvider>}
