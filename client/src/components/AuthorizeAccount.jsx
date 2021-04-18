import 'bootstrap/dist/css/bootstrap.min.css'
import React, {Component} from 'react'
import { Card, Form, Button } from 'react-bootstrap'

class AuthorizeAccount extends Component {

	handleClick = async (event) => {
		event.preventDefault()

		await this.props.contract.methods
		.registerVoter(this.address.value)
		.send({ from: this.props.account })
	}




	registerVoter = async (address) => {
		// Interaction avec le smart contract pour ajouter un compte
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
