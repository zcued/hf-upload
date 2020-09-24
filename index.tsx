import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import AliExample from './example/ali'
import QiniuExample from './example/qiniu'
import Example from './example'
function App() {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path="/ali" component={AliExample} />
          <Route path="/qiniu" component={QiniuExample} />
          <Route path="/" component={Example} />
        </Switch>
      </BrowserRouter>
    </div>
  )
}

ReactDom.render(<App />, document.getElementById('root'))
