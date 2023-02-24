import React from 'react'
import { View, Text, Button } from 'react-native'

import ColorPicker from 'react-native-wheel-color-picker'

export class ColorWheel extends React.Component {
	
	constructor(...args) {
		super(...args)
		this.state = { color: ("#8b9cb5") }
		this.onColorChange = this.onColorChange.bind(this)
	}
	sendColor = () => {
		this.props.updateColor(this.state.color);
   	}

	onColorChange(color) {
		this.setState({ color })
	}

	render() {
	return (
		<View style={{flex: 1, padding: 45}}>
		<ColorPicker
			oldColor='purple'
			color={this.state.color}
			onColorChange={this.onColorChange}
			style={{flex: 1}}
		/>
		<Button
			title="Select Color"
			onPress={this.sendColor}
		/>
		</View>
	)
	}
}
