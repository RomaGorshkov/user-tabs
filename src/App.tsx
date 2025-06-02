import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout/AppLayout";
import { tabItems } from "./mockData/mockData";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {tabItems.map((tab) => (
            <Route
              key={tab.id}
              index={tab.to === "/"}
              path={tab.to === "/" ? undefined : tab.to.substring(1)}
              element={<div>{tab.title} Page</div>}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
