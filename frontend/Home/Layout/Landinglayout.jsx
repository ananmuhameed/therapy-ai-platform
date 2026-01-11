import HomeNav from "../components/HomeNav/HomeNav";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
const Mainlayout = () => {
  return (
    <div >
      <HomeNav />
      <Outlet />
      <Footer/>
    </div>
  );
};

export default Mainlayout;
