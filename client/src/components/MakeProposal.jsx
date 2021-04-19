import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { Card, Form, Button } from 'react-bootstrap'

function MakeProposal(props) {
	let inputProposal = ''

	const handleClick = async (event) => {
		event.preventDefault()

		try {
			await props.contract.methods
				.giveProposal(inputProposal)
				.send({ from: props.account })
		} catch (error) {
			console.error(error)
		}
	}

	const handleChange = (event) => {
		event.preventDefault()

		inputProposal = event.target.value
	}

	return (
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			<Card style={{ width: '50rem' }}>
				<Card.Header>
					<strong>Faire une proposition</strong>
				</Card.Header>
				<Card.Body>
					<Form.Group>
						<Form.Control onChange={handleChange} type="text" id="proposal" />
					</Form.Group>
					<Button onClick={handleClick} variant="dark">
						{' '}
						Envoyer{' '}
					</Button>
				</Card.Body>
			</Card>
		</div>
	)
}

export default MakeProposal
