'use client';
// Loads a design view on the client (views own WebGL canvases and browser APIs) and hands it the router.
import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';


const VIEWS = {
  Landing: dynamic(() => import('@/views/Landing'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Login: dynamic(() => import('@/views/Login'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Access: dynamic(() => import('@/views/Access'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Demo: dynamic(() => import('@/views/Demo'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Platform: dynamic(() => import('@/views/Platform'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Solutions: dynamic(() => import('@/views/Solutions'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Company: dynamic(() => import('@/views/Company'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Dashboard: dynamic(() => import('@/views/Dashboard'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  MissionsLog: dynamic(() => import('@/views/MissionsLog'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  NewInspection: dynamic(() => import('@/views/NewInspection'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  MissionTwin: dynamic(() => import('@/views/MissionTwin'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  MissionReport: dynamic(() => import('@/views/MissionReport'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Frames: dynamic(() => import('@/views/Frames'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  LiveOps: dynamic(() => import('@/views/LiveOps'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Analytics: dynamic(() => import('@/views/Analytics'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Sites: dynamic(() => import('@/views/Sites'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  SiteDetail: dynamic(() => import('@/views/SiteDetail'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Fleet: dynamic(() => import('@/views/Fleet'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Aircraft: dynamic(() => import('@/views/Aircraft'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  MissionPlanner: dynamic(() => import('@/views/MissionPlanner'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Reports: dynamic(() => import('@/views/Reports'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  Status: dynamic(() => import('@/views/Status'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  SignalLost: dynamic(() => import('@/views/SignalLost'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  SettingsProfile: dynamic(() => import('@/views/SettingsProfile'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  SettingsOrganization: dynamic(() => import('@/views/SettingsOrganization'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  SettingsTeam: dynamic(() => import('@/views/SettingsTeam'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  SettingsApiKeys: dynamic(() => import('@/views/SettingsApiKeys'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  SettingsModels: dynamic(() => import('@/views/SettingsModels'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
  AuditLog: dynamic(() => import('@/views/AuditLog'), { ssr: false, loading: () => <div className="view-loading"><i />Loading</div> }),
};

export default function ViewHost({ view, ...props }) {
  const router = useRouter();
  const View = VIEWS[view];
  if (!View) return null;
  return <View {...props} router={router} />;
}
