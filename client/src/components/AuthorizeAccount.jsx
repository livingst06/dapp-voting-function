import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { Card, Form, Button } from 'react-bootstrap'

function AuthorizeAccount(props) {

	let localAddress = ''

	const handleClick = async (event) => {
		event.preventDefault()

		await props.contract.methods
		.registerVoter(localAddress)
		.send({ from: props.account })
	}


	const handleChange = (event) => {
		event.preventDefault()

		localAddress = event.target.value
	}

	return (
	
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			<Card style={{ width: '50rem' }}>
					<Card.Header>
						<strong>Autoriser un nouveau compte</strong>
					</Card.Header>
					<Card.Body>
						<Form.Group>
							<Form.Control onChange={handleChange}
								type="text"
								id="address"
									
							/>
						</Form.Group>
						<Button onClick={handleClick} variant="dark">
							{' '}
							Autoriser{' '}
						</Button>
					</Card.Body>
			</Card>
		</div>
	)
}

export default AuthorizeAccount
