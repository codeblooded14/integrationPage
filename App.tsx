import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  FlatList,
} from 'react-native';
import BleManager from 'react-native-ble-manager';

const DEVICE_ID = 'C8:C9:A3:F9:C6:1A';
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

interface Peripheral {
  id: string;
  name: string;
}

const App: React.FC = () => {
  const [scannedDevices, setScannedDevices] = useState<Peripheral[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<Peripheral[]>([]);
  const [receivedData, setReceivedData] = useState<string>('');

  useEffect(() => {
    BleManager.start({ showAlert: false });
    BleManager.enableBluetooth()
      .then(() => console.log('Bluetooth enabled'))
      .catch((error) => console.error('Failed to enable Bluetooth', error));
  }, []);

  const startScan = () => {
    BleManager.scan([], 5, true)
      .then(() => console.log('Scan started'))
      .catch((error) => console.error('Scan failed to start', error));
  };

  const retrieveConnectedDevices = () => {
    BleManager.getConnectedPeripherals([])
      .then((results) => {
        setConnectedDevices(results);
        console.log('Connected devices', results);
      })
      .catch((error) => console.error('Failed to retrieve connected devices', error));
  };

  const receiveData = async () => {

    async function convertPromiseToArray() {
      try {
        const result = await BleManager.retrieveServices(DEVICE_ID);;
        console.debug(result);
        const array = Array.isArray(result) ? result : [result];
        console.info(array)
        return array;
      } catch (error) {
        console.error(error);
      }
    }
    
    try {
      await BleManager.connect(DEVICE_ID);
      console.log('Connected to device', DEVICE_ID);
  
      // let service;
      // const peripheralInfo = convertPromiseToArray();
      // console.log("Passed peripheralInfo",peripheralInfo);
      // for (let i = 0; i < peripheralInfo.length; i++) {
      //   const peripheral = peripheralInfo[i];
      //   for (let j = 0; j < peripheral.characteristics.length; j++) {
      //     const characteristic = peripheral.characteristics[j];
      //     if (characteristic.uuid === CHARACTERISTIC_UUID) {
      //       service = peripheral;
      //       break;
      //     }
      //   }
      //   if (service) {
      //     break;
      //   }
      // }
  
      // if (!service) {
      //   throw new Error('Service not found');
      // }
  
      // const characteristic = service.characteristics.find((characteristic: { uuid: string; }) => characteristic.uuid === CHARACTERISTIC_UUID);
      // if (!characteristic) {
      //   throw new Error('Characteristic not found');
      // }
  
      const data = await BleManager.read(DEVICE_ID, "4fafc201-1fb5-459e-8fcc-c5c9c331914b", "beb5483e-36e1-4688-b7f5-ea07361b26a8");
      console.log('Received data', data);
      setReceivedData(JSON.stringify(data));
    } catch (error) {
      console.error('Failed to receive data', error);
    }
  };
  
  
  const renderItem = ({ item }: { item: Peripheral }) => (
    <View style={{ padding: 10 }}>
      <Text>Peripheral: {item.name}</Text>
      <Text>Peripheral ID: {item.id}</Text>
    </View>
  );

  return (
    <SafeAreaView>
      <View>
        <Button title="Scan Devices" onPress={startScan} />
        <Button title="Connected Devices" onPress={retrieveConnectedDevices} />
        <Button title="Receive Data" onPress={receiveData} />

        <Text>Scanned Devices:</Text>
        <FlatList
          data={scannedDevices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />

        <Text>Connected Devices:</Text>
        <FlatList
          data={connectedDevices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />

        {receivedData !== '' && (
          <>
            <Text>Received Data:</Text>
            <Text>{receivedData}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default App;
