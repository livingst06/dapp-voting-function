import React from 'react'
import {Navbar} from 'react-bootstrap'

function TheNavbar(props) {
	return (
<Navbar>
  <Navbar.Collapse className="justify-content-end">
    <Navbar.Text>
    <p>your account address : {props.account}</p>
    <p>wfs: {props.wfs}</p>
    </Navbar.Text>
  </Navbar.Collapse>
</Navbar>	)
}

export default TheNavbar
