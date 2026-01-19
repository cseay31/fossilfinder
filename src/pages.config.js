import Admin from './pages/Admin';
import CommunityShowcase from './pages/CommunityShowcase';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import DiscoveryMap from './pages/DiscoveryMap';
import Education from './pages/Education';
import Experts from './pages/Experts';
import Forum from './pages/Forum';
import FosFeed from './pages/FosFeed';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import MultiScan from './pages/MultiScan';
import MultiScanDiscoveries from './pages/MultiScanDiscoveries';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Wiki from './pages/Wiki';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "CommunityShowcase": CommunityShowcase,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "DiscoveryMap": DiscoveryMap,
    "Education": Education,
    "Experts": Experts,
    "Forum": Forum,
    "FosFeed": FosFeed,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "MultiScan": MultiScan,
    "MultiScanDiscoveries": MultiScanDiscoveries,
    "Profile": Profile,
    "Upload": Upload,
    "Wiki": Wiki,
}

export const pagesConfig = {
    mainPage: "Upload",
    Pages: PAGES,
    Layout: __Layout,
};