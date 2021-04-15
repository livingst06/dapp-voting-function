import 'bootstrap/dist/css/bootstrap.min.css'
import React, {Component} from 'react'
import { Card, Form, Button } from 'react-bootstrap'

class AuthorizeAccount extends Component {

	handleClick = async (event) => {
		event.preventDefault()

		//		const address = ReactDOM.findDOMNode('address').value;
		const address = this.address.value

		await this.props.registerVoter(address)
	}

	render () {
			return (
			
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Card style={{ width: '50rem' }}>
						<Card.Header>
							<strong>Autoriser un nouveau compte</strong>
						</Card.Header>
						<Card.Body>
							<Form.Group>
								<Form.Control
									type="text"
									id="address"
									ref={(input) => {
										this.address = input
									}}
								/>
							</Form.Group>
							<Button onClick={this.handleClick} variant="dark">
								{' '}
								Autoriser{' '}
							</Button>
						</Card.Body>
				</Card>
			</div>
		)
	}		
}

export default AuthorizeAccount
