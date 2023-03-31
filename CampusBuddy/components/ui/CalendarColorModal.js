import React, { useState } from 'react';
import { View, Text, Modal, Button, TextInput, TouchableOpacity } from 'react-native';

import ColorPicker from 'react-native-wheel-color-picker'

export default class CalendarColorModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
        //this.saveData = this.saveData.bind(this);
    }

    handleClose = () => {
        this.props.closeCalendarColorModal();
    }

    render() {
        const {modalOpen, setModalOpen} = this.props;
        return (
            <Modal
                visible={false}
                animationType="slide"
                transparant={true}>
                <View>
                    <Text>Testing modal</Text>
                </View>
            </Modal>
    
    
        )
    }

}