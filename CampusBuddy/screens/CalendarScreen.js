import React, { Component } from 'react';
import { readString } from 'react-native-csv';
import {
  StyleSheet,
  Button,
  View,
  SafeAreaView,
  Text,
  Alert,
  Linking,
  TouchableOpacity,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import TimeTableView, { genTimeBlock } from 'react-native-timetable';
import { addSchedule } from '../firebaseConfig';
import { auth, db } from '../firebaseConfig';
import { 
  ref,
  onValue,
  push,
  update,
  remove } from 'firebase/database';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.numOfDays = 7;
    this.pivotDate = genTimeBlock('mon');
    this.state = {
      visible: false,
      list: []
    }
  }

  componentDidMount() {
    
  }

  scrollViewRef = (ref) => {
    this.timetableRef = ref;
  };

  onEventPress = (evt) => {
    Alert.alert("onEventPress", JSON.stringify(evt));
  };

  clickHandler = () => {
    this.setState({visible: true})
  };

  openURL = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  }

  openDocumentFile = async () =>{
    const res = await DocumentPicker.getDocumentAsync({}); 
    fetch(res.uri)
    .then(async (response) => {
      const resp = await response.text();
      var result = readString(resp,{header: true})
      result.data.forEach((product) => {
        
        if((product["Type"] == "Midterm Examination") && (product["Published End"] != null)){
          this.state.list.push(product["Type"] +";"+product["Name"]+";"+product["First Date"]+";"+product["Published Start"]+";"+product["Published End"]+";"+product["Location"])
        }else if(/[0-9]/.test(product["Published Start"])){
          const st = product["Published Start"].split(":");
          const ed = end= product["Published End"].split(":");
          var start, start_min, end, end_min;
          if(product["Published Start"].lastIndexOf("a") > -1){
            start = st[0]
            start_min = st[1].replace("a", "")
          }else if(product["Published End"].lastIndexOf("p") > -1){
            st[0] != "12" ? start = parseInt(st[0],10) + 12 : start = parseInt(st[0],10);
            start_min = st[1].replace("p", "")
          }
          if(product["Published End"].lastIndexOf("a") > -1){
            end= ed[0]
            end_min = ed[1].replace("a","")
          }else if(product["Published End"].lastIndexOf("p") > -1){
            ed[0] != "12" ? end= parseInt(ed[0],10) + 12 : end = parseInt(ed[0], 10);
            end_min = ed[1].replace("p","")
          }
          for (var i=0; i<product["Day Of Week"].length; i++){
            //Monday
            if(product["Day Of Week"][i] == 'M'){
              this.state.list.push({
                title: product["Name"] + " ("+product["Type"]+")",
                startTime: genTimeBlock("MON", start, start_min),
                endTime: genTimeBlock("MON", end, end_min),
                location: product["Location"],
              })
            //Tuesday
            }else if(product["Day Of Week"][i] == 'T' && product["Day Of Week"].length > i+1 && product["Day Of Week"][i+1] != 'h'){
              this.state.list.push({
                title: product["Name"] + " ("+product["Type"]+")",
                startTime: genTimeBlock("TUE", start, start_min),
                endTime: genTimeBlock("TUE", end, end_min),
                location: product["Location"],
              })
            //Wednesday
            }else if(product["Day Of Week"][i] == 'W'){
              this.state.list.push({
                title: product["Name"] + " ("+product["Type"]+")",
                startTime: genTimeBlock("WED", start, start_min),
                endTime: genTimeBlock("WED", end, end_min),
                location: product["Location"],
              })
            //Thursday
            }else if(product["Day Of Week"][i] == 'T' && product["Day Of Week"][i+1] == 'h'){
              this.state.list.push({
                title: product["Name"] + " ("+product["Type"]+")",
                startTime: genTimeBlock("THU", start, start_min),
                endTime: genTimeBlock("THU", end, end_min),
                location: product["Location"],
              })
            //Friday
            }else if(product["Day Of Week"][i] == 'F'){
              this.state.list.push({
                title: product["Name"] + " ("+product["Type"]+")",
                startTime: genTimeBlock("FRI", start, start_min),
                endTime: genTimeBlock("FRI", end, end_min),
                location: product["Location"],
              })
            //Saterday
            }else if(product["Day Of Week"][i] == 'S'){
              this.state.list.push({
                title: product["Name"] + " ("+product["Type"]+")",
                startTime: genTimeBlock("SAT", start, start_min),
                endTime: genTimeBlock("SAT", end, end_min),
                location: product["Location"],
              })
            //Sunday
            }else if(product["Day Of Week"][i] == 'U'){
              
              this.state.list.push({
                title: product["Name"] + " ("+product["Type"]+")",
                startTime: genTimeBlock("SUN", start, start_min),
                endTime: genTimeBlock("SUN", end, end_min),
                location: product["Location"],
              })
            }
          }
        }
      })
      const uniqueArray = this.state.list.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === this.state.list.findIndex(obj => {
          return JSON.stringify(obj) === _value;
        });
      });
      this.setState({list: uniqueArray})
      this.setState({visible: !this.state.visible})
      addSchedule(auth.currentUser?.uid, this.state.list);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => {
          this.setState({visible: !this.state.visible})
        }}>
          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <View style={{width: '90%', height: "70%", backgroundColor: 'white'}}> 
            <Text style={styles.title}>
                1. Click the Button{'\n'}
                2. Sign in to your University account{'\n'}
                3. Click the menu --> Personal Schedule{'\n'}
                4. Export --> Export CSV{'\n'}
            </Text>
            <Button
              title="Download schedule"
              onPress={() => this.openURL('https://timetable.mypurdue.purdue.edu/Timetabling/gwt.jsp?page=personal')}
            />
            <Text>{'\n'}</Text>
            <Button 
              title="Import schedule"
              onPress={() => this.openDocumentFile()}
            />
            
          </View>
        </View>
        </Modal>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={this.clickHandler}
          style={styles.touchableOpacityStyle}>
          <Icon name="plus-circle" size={50} />
        </TouchableOpacity>
        <View style={styles.container}>
          <TimeTableView
            scrollViewRef={this.scrollViewRef}
            events={this.state.list}
            pivotTime={7}
            pivotEndTime={24}
            pivotDate={this.pivotDate}
            nDays={this.numOfDays}
            onEventPress={this.onEventPress}
            headerStyle={styles.headerStyle}
            formatDateHeader="dddd"
            locale="en"
          />
        </View>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#81E1B8'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  touchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    right: 30,
    bottom: 30,
    zIndex: 1
  },
});