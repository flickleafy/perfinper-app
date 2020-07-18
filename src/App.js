import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import 'materialize-css/dist/css/materialize.min.css';
import './App.css';
import { Navbar } from 'react-materialize';
import { NavItem } from 'react-materialize';
import { Icon } from 'react-materialize';

import InsertTransaction from './components/InsertTransaction';
import EditTransaction from './components/EditTransaction';
import TransactionsList from './components/TransactionsList';

function App() {
  return (
    <Router>
      <div>
        <Navbar
          className="brown lighten-1 z-depth-3"
          alignLinks="left"
          brand={<Icon>home</Icon>}
          id="mobile-nav"
          centerChildren={true}
          centerLogo={true}
          options={{
            draggable: true,
            edge: 'left',
            inDuration: 250,
            onCloseEnd: null,
            onCloseStart: null,
            onOpenEnd: null,
            onOpenStart: null,
            outDuration: 200,
            preventScrolling: true,
          }}
        >
          <NavItem href="/lista">Lançamentos</NavItem>
          <NavItem href="/inserir">Novo Lançamento</NavItem>
        </Navbar>
        <div className="container">
          <Switch>
            <Route exact path={['/', '/lista']} component={TransactionsList} />
            <Route exact path="/inserir" component={InsertTransaction} />
            <Route path="/editar/:id" component={EditTransaction} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;

/*
<nav className="navbar navbar-expand navbar-dark bg-dark">
          <a href="/" className="navbar-brand">
            Aplicativo
          </a>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={'/lista'} className="nav-link">
                Lançamentos
              </Link>
            </li>
            <li className="nav-item">
              <Link to={'/inserir'} className="nav-link">
                Novo Lançamento
              </Link>
            </li>
          </div>
        </nav>
 */
