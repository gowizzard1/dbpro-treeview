# dbpro-treeview
generic treeview

# Description
The project is a desktop app compiled with ReactJs and Golang using Wails framework.

## How to run
* make sure that you have wails installed to your computer. To install it, follow these steps here https://wails.app/gettingstarted/installing/
* install npm 
* Go to the project/frontend directory then install all the frontend dependencies using `npm install` command.
* Cd back to your project directory and build/compile your project using `wails build` command.
* An executable file will be dumped to project/build folder.

# TODO
- Move some of the tree logic to golang, leaving the fire events functionalities in react
- Allow edit on toggle button
- Move the properties (size, colors, icons etc) to UI
- Add filter logic and UI filter ability
- Add copy logic
