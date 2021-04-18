import 'bootstrap/dist/css/bootstrap.min.css'
import React, { Component } from 'react'
import { Card, Form, Button } from 'react-bootstrap'

class MakeProposal extends Component {
	handleClick = async (event) => {
		event.preventDefault()

		


		await this.props.contract.methods
			.giveProposal(this.proposal.value)
			.send({ from: this.props.account })
		
	}

	render() {
		return (
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Card style={{ width: '50rem' }}>
					<Card.Header>
						<strong>Faire une proposition</strong>
					</Card.Header>
					<Card.Body>
						<Form.Group>
							<Form.Control
								type="text"
								id="proposal"
								ref={(input) => {
									this.proposal = input
								}}
							/>
						</Form.Group>
						<Button onClick={this.handleClick} variant="dark">
							{' '}
							Envoyer{' '}
						</Button>
					</Card.Body>
				</Card>
			</div>
		)
	}
}

export default MakeProposal
