import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Experts from './pages/Experts';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Education from './pages/Education';
import Wiki from './pages/Wiki';
import Forum from './pages/Forum';
import DiscoveryMap from './pages/DiscoveryMap';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Upload": Upload,
    "Dashboard": Dashboard,
    "Experts": Experts,
    "Admin": Admin,
    "Contact": Contact,
    "Education": Education,
    "Wiki": Wiki,
    "Forum": Forum,
    "DiscoveryMap": DiscoveryMap,
}

export const pagesConfig = {
    mainPage: "Upload",
    Pages: PAGES,
    Layout: __Layout,
};