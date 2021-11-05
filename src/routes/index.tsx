import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

const Routes: React.FC = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route
                    path="/"
                    component={React.lazy(() => import('@/pages/Main'))}
                />
            </Switch>
        </BrowserRouter>
    )
}

export default Routes

