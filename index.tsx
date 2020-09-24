import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import Example from './example/ali'
import QiniuExample from './example/qiniu'
function App() {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path="/oss" component={Example} />
          <Route path="/qiniu" component={QiniuExample} />
          <Redirect to="/oss" />
        </Switch>
      </BrowserRouter>
    </div>
  )
}

ReactDom.render(<App />, document.getElementById('root'))
