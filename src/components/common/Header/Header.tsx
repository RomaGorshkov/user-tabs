import React from "react";
import Tabs from "../../bussines/Tabs/Tabs";

import styles from "./Header.module.scss";

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <Tabs />
    </div>
  );
};

export default Header;
