import React, { PureComponent, Suspense, lazy } from "react";
import { withRouter, Switch, Route } from "react-router-dom";
// lazy load everything because more gooder
const Main = lazy(() => import("./pages/main.jsx"));

class App extends PureComponent {
  render() {
    return (
      <div>
        <Switch>
          <Suspense fallback={<div></div>}>
            <Route exact strict component={() => <Main />} path="/" />
          </Suspense>
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);