import React from "react";
import { LanguageSwitcher } from "../language-switcher";
import { Theme } from "../theme";

const Header: React.FC = () => {
  return (
    <div className="flex flex-row justify-end p-4 items-center space-x-4">
      <LanguageSwitcher />
      <Theme />
    </div>
  );

  {
    /* <div className="p-4 flex justify-end items-center z-50 bg-background-light-600 dark:bg-background-dark-600">
      <LanguageSwitcher />
    </div> */
  }
};

export default Header;
