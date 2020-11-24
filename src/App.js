import React from 'react';
import 'antd/dist/antd.css'
import './App.css';
import {ConfigureStore} from "./redux/store"
import Main from "./pages/Main";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";

const store = ConfigureStore()

function App() {

  return (
      <Provider store={store}>
          <Router>
              <Main />
          </Router>
      </Provider>
  );
}

export default App;
