import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Chat from './components/Chat';

import './custom.css'

export default () => (
    <Layout>
        <Route exact path='/:routerNickName?' component={Chat} />
    </Layout>
);
