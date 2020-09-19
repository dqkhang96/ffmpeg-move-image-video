/**
 * React renderer.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import _ from 'lodash'

// Import the styles here to process them with webpack
import '@public/style.css';
import MetaForm from '@/component/MetaForm';
import storage from 'electron-json-storage'

storage.getMany(["position", "size", "filePath", "text"], (error, data: any) => {
  const { position, size, filePath, text } = data
  console.log(position, size, filePath, text)
  if (error) throw error;
  let dataStore: any = {}

  dataStore.position = _.isEmpty(position) ? { x: 0, y: 0 } : position
  dataStore.size = _.isEmpty(size) ? { width: 320, height: 180 } : size
  dataStore.filePath = _.isEmpty(filePath) ? { backgroundImage: "", backgroundVideo: "" } : filePath
  dataStore.text = _.isEmpty(text) ? { templateString: `ffmpeg -y -i "{{inputFile}}" -i "{{backgroundImage}}" -filter_complex "[0:v]scale={{videoSize}},setpts=PTS/1.1,pad=iw+4:ih+4:2:2:color=white,boxblur=0.2[v]; movie={{backgroundVideo}}:loop=999,setpts=N/(FRAME_RATE*TB)[bg];[bg]scale=1280:720,setpts=PTS/1.1,pad=iw+4:ih+4:2:2:color=white,boxblur=0.2[bgscale]; [bgscale][v]overlay=shortest=1:x={{x}}:y={{y}}[v1]; [v1][1:v]overlay=0:0;[0:a]atempo=1.1,bass=frequency=300:gain=-70,volume=+13dB,aecho=1:0.9:2:0.4,bass=g=3:f=110:w=20,bass=g=10:f=500:w=20,bass=g=3:f=300:w=30,bass=g=10:f=110:w=20,bass=g=20:f=110:w=40,firequalizer=gain_entry='entry(0,-23);entry(250,-11.5);entry(6000,0);entry(12000,8);entry(16000,16)',compand=attacks=7:decays=1:points=-90/-90 -70/-60 -15/-15 0/-10:soft-knee=1:volume=-70:gain=3,pan=stereo| FL < FL + 0.5*FC + 0.6*BL + 0.6*SL | FR < FR + 2*FC + 1*BR + 2*SR,highpass=f=300,lowpass=f=700,volume=4" -vcodec libx264 -pix_fmt yuv420p -r 30 -g 60 -b:v 1500k -acodec libmp3lame -b:a 128k -ar 44100 -metadata title="" -metadata artist="" -metadata album_artist="" -metadata album="" -metadata date="" -metadata track="" -metadata genre="" -metadata publisher="" -metadata encoded_by="" -metadata copyright="" -metadata composer="" -metadata performer="" -metadata TIT1="" -metadata TIT3="" -metadata disc="" -metadata TKEY="" -metadata TBPM="" -metadata language="eng" -metadata encoder="" -threads 0 "{{output}}"` } : text
  console.log(dataStore)
  ReactDOM.render(
    <div className='app'>
      <MetaForm dataStore={dataStore} />
    </div>,
    document.getElementById('app')
  );
})

