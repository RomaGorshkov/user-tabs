import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../../components/common/Header/Header";

const AppLayout: React.FC = () => {
  return (
    <>
      <Header />
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default AppLayout;
