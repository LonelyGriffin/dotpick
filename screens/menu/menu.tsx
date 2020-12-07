import React from 'react'
import {View, FlatList, Text, StyleSheet} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {NavigationStateSynchronizer} from '../../common/navigation/navigation_store_synchronizer'
import {Header} from '../../components/header'

type Props = {}

const Data = [
  {
    id: '1',
    title: 'title 1'
  },
  {
    id: '2',
    title: 'title 2'
  },
  {
    id: '3',
    title: 'title 3'
  },
  {
    id: '4',
    title: 'title 4'
  },
  {
    id: '5',
    title: 'title 5'
  }
]

export const Menu = (props: Props) => {
  return (
    <View style={styles.fullSize}>
      <NavigationStateSynchronizer />
      <Header />
      <ScrollView horizontal>
        <View style={styles.list}>
          {Data.map((item) => (
            <View key={item.id} style={styles.item}></View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  fullSize: {
    width: '100%',
    height: '100%'
  },
  list: {
    backgroundColor: '#E5E5E5',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    flexWrap: 'wrap'
  },
  item: {
    width: 72,
    height: 72,
    margin: 20,
    backgroundColor: '#C4C4C4'
  }
})
