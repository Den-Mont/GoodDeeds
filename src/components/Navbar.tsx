import Login_Button from "./Login_Button"; 

const Navbar = () => {
  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold">GoodDeeds</h1>
      <Login_Button />
    </nav>
  );
};

export default Navbar;