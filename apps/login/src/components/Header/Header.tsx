import React from "react";
import { LanguageSwitcher } from "../language-switcher";
import { Theme } from "../theme";

const Header: React.FC = () => {
  return (
    <div className="absolute top-0 right-0 p-4 z-10">
      <div className="flex flex-row items-center space-x-4">
        <LanguageSwitcher />
        <Theme />
      </div>
    </div>
  );

  {
    /* <div className="p-4 flex justify-end items-center z-50 bg-background-light-600 dark:bg-background-dark-600">
      <LanguageSwitcher />
    </div> */
  }
};

export default Header;
