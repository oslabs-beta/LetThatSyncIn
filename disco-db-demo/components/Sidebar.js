import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import NotesIcon from '@mui/icons-material/Notes';
import { Button } from '@mui/material';
import { dexieAdd } from '../public/db'

const drawerWidth = 240;

export default function SideBar(props) {
const router = useRouter();
const [setSidebar, setNewSidebar] = useState([]);
//Saves all notes as buttons for user on front-end for later access.
const sidebarArray = [];
const userNoteArr = [];

console.log('this is in sidebar.js', props.noteArray);

//On initial render, invoke useEffect to grab all notes on props pertaining to user.
//Populate the notes in an array and update state to reflect.

  useEffect(() => {
    props.noteArray.forEach((ele) => {
    //usernote has entire object per note for user
    console.log(ele.title);
    const userNoteButton = <ListItem button id={ele._id} key={ele._id} onClick={currNoteHandler}>
    <NotesIcon></NotesIcon>
    <ListItemText primary={ele.title || 'Untitled Note...'}/>
    </ListItem>
  //Convert each usernote into a button and push in array for useState.
    sidebarArray.push(userNoteButton);
    })
    setNewSidebar([sidebarArray])
  }, [props.noteArray])

  function newNoteHandler(){
    //POST request to user/notes with object of {username: username, createdAt: unix time}
    //Expect response of res.locals.data = {_id:id}
    //Poplate note array with a new icon with unique ID
    const newNoteInfo = {
      //Placeholder username, need to replace 
      username: localStorage.getItem('user'),
      createdAt: Date.now()
    }
    const testURL = '/api/hello';
    const devURL = '/user/notes';
    fetch(devURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNoteInfo),
    })
    .then(res => res.json())
    .then((data) => {
      console.log('this is the response from NEW NOTE button', data);
      const uniqId = data.data._id;

      //testing - add new note to indexedDB
      const testData = {
        username: ['erictest02'],
        _id: uniqId,
        title: '',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      //dexieAdd(testData);
      //random num for testing purposes
      //const ranNum = Math.ceil(Math.random() * 10)
      const newNote = 
          <ListItem button id={uniqId} key={uniqId} onClick={currNoteHandler}>
            <NotesIcon></NotesIcon>
            <ListItemText primary="Untitled Note..."/>
          </ListItem>
          setNewSidebar([...setSidebar, newNote])
          props.setRefresh(true);
    })
    .catch(async (err) => {
      console.log('invoking post bgs'); 
      //Sends failed patch object to service worker file.
      const data = {
        postNote: {...newNoteInfo}
      }
      console.log('postnote data', data)
      await navigator.serviceWorker.controller.postMessage(data);
      backgroundSync()
    });
  };
  //Click handler to obtain ID attribute and shallow route to the note.
  function currNoteHandler (e){
    const targetId = e.currentTarget.id
    router.push(`/user/notes?${targetId}`, undefined, {shallow: true});
  }

  async function backgroundSync(event) {
    const registration = await navigator.serviceWorker.ready;
    console.log('registered sync event')
    await registration.sync.register('failed_requests');
  }

  return (
    <Box>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <Button sx={{ mt: 3 }} variant="outlined" onClick={newNoteHandler}>New Note</Button>
        <Divider />
        <List>
          {setSidebar}
        </List>
      </Drawer>
    </Box>
  );
}
