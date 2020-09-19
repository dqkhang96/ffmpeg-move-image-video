import React, { Component, useState } from 'react'
import { InputLabel, TextareaAutosize, TextField, makeStyles, Button } from '@material-ui/core'
import { AttachFile, HourglassEmpty, Label } from '@material-ui/icons';
import { BrowserWindow } from 'electron';
import { Rnd } from 'react-rnd';
import storage from 'electron-json-storage'

const electron = require('electron').remote
const dialog = electron.dialog
const { clipboard } = require('electron')

interface OutputVideo {
    x?: number
    y?: number
    width?: number
    height?: number
}


interface DataStore {
    position: {
        x: number
        y: number
    }

    size: {
        width: number
        height: number
    }

    filePath: {
        backgroundImage: string
        backgroundVideo: string
    }
    text: {
        templateString: string
    }

}

interface Props {
    dataStore: DataStore
}



const ex2 = (value: number | undefined) => {
    if (!value)
        return 0;
    return value * 2
}

export default function MetaForm({ dataStore }: Props) {
    const { position, size, filePath, text } = dataStore
    const [inputFile, setInputFile] = useState("")
    const [outputFile, setOutputFolder] = useState("")
    const [videoSize, setVideoSize] = useState(size)
    const [videoPosition, setVideoPosition] = useState(position)
    const [backgroundImage, setBackgroundImage] = useState(filePath.backgroundImage)
    const [backgroundVideo, setBackgroundVideo] = useState(filePath.backgroundVideo)
    const [templateString, setTemplateString] = useState(text.templateString)

    //useState(``)
    const [showCopyText, setShowCopyText] = useState(false)
    let cmdOutput: string = templateString.replace('{{inputFile}}', inputFile)
        .replace('{{backgroundImage}}', backgroundImage)
        .replace('{{videoSize}}', `${ex2(videoSize.width)}:${ex2(videoSize.height)}`)
        .replace('{{backgroundVideo}}', backgroundVideo)
        .replace('{{x}}', `${ex2(videoPosition.x)}`)
        .replace('{{y}}', `${ex2(videoPosition.y)}`)
        .replace('{{output}}', outputFile)

    return (
        <div className="container">
            <form className="form-input" noValidate autoComplete="off">
                <div className="group-inputs">
                    <div className="input-attach">
                        <TextField type="string" label="Input file"
                            value={inputFile}
                            InputProps={{
                                className: "text-field"
                            }}
                            onChange={(event) => setInputFile(event.target.value)}
                        />
                        <Button
                            size="small"
                            color="primary"
                            onClick={() => {
                                const listFile = dialog.showOpenDialog({ properties: ['openFile'] });
                                if ((listFile) && (listFile.length > 0))
                                    setInputFile(listFile[0])
                            }}

                            startIcon={<AttachFile color={"primary"} />}
                        >Select file</Button>
                    </div>
                    <div className="input-attach ">
                        <TextField type="string"
                            label="Output file"
                            value={outputFile}
                            InputProps={{
                                className: "text-field"
                            }}
                            onChange={(event) => setOutputFolder(event.target.value)}
                        />
                        <Button
                            size="small"
                            color="primary"
                            onClick={() => {
                                const listFile = dialog.showSaveDialog(electron.getCurrentWindow(), {
                                    buttonLabel: "Save video",
                                    title: "Sơn gay",
                                    filters: [
                                        { name: 'Movies', extensions: ['mp4', 'mkv', 'avi'] },
                                        { name: 'All Files', extensions: ['*'] }
                                    ]
                                });

                                if ((listFile))
                                    setOutputFolder(listFile)
                            }}

                            startIcon={<AttachFile color={"primary"} />}
                        >Select file</Button>
                    </div>

                </div>

                <div className="group-inputs">
                    <div className="input-attach ">
                        <TextField type="string"
                            label="Background image file"
                            value={backgroundImage}
                            InputProps={{
                                className: "text-field"
                            }}
                            onChange={(event) => {
                                setBackgroundImage(event.target.value);
                                storage.set("filePath", { backgroundImage: event.target.value, backgroundVideo }, (err) => {
                                    console.log(err)
                                })
                            }}
                        />
                        <Button
                            size="small"
                            color="primary"
                            onClick={() => {
                                const listFile = dialog.showOpenDialog({
                                    properties: ['openFile'], filters: [
                                        { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
                                        { name: 'All', extensions: ['*'] }
                                    ]
                                });
                                if ((listFile) && (listFile.length > 0)) {
                                    setBackgroundImage(listFile[0])
                                    storage.set("filePath", { backgroundImage: listFile[0], backgroundVideo }, (err) => {
                                        console.log(err)
                                    })
                                }

                            }}

                            startIcon={<AttachFile color={"primary"} />}
                        >Select file</Button>
                    </div>

                    <div className="input-attach ">
                        <TextField type="string" label="Background video file"
                            value={backgroundVideo}
                            InputProps={{
                                className: "text-field"
                            }}
                            onChange={(event) => {
                                setBackgroundVideo(event.target.value)

                                storage.set("filePath", { backgroundImage, backgroundVideo: event.target.value }, (err) => {
                                    console.log(err)
                                })

                            }}
                        />
                        <Button
                            color="primary"
                            size="small"
                            onClick={() => {
                                const listFile = dialog.showOpenDialog({
                                    properties: ['openFile'],
                                    filters: [
                                        { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
                                        { name: 'All', extensions: ['*'] }
                                    ]
                                });
                                if ((listFile) && (listFile.length > 0)) {
                                    setBackgroundVideo(listFile[0])
                                    storage.set("filePath", { backgroundImage, backgroundVideo: listFile[0] }, (err) => {
                                        console.log(err)
                                    })
                                }

                            }}

                            startIcon={<AttachFile color={"primary"} />}
                        >Select file</Button>
                    </div>
                </div>
            </form >
            <div className="space-drag-and-output">
                <div className="space-drag">
                    {backgroundImage && (<img className="background-image" src={backgroundImage} />)}
                    <Rnd
                        default={{
                            height: size.height,
                            width: size.width,
                            x: position.x,
                            y: position.y
                        }}

                        onResize={(e, direction, ref, delta, position) => {
                            setVideoSize({ width: ref.offsetWidth, height: ref.offsetHeight })
                        }}
                        onDrag={(e, ref) => {
                            setVideoPosition({ x: ref.x + 2, y: ref.y + 2 })
                        }}

                        onDragStop={(e, ref) => {
                            storage.set("position", { x: ref.x + 2, y: ref.y + 2 }, (err) => {
                                console.log(err)
                            })
                        }}

                        onResizeStop={(e, direction, ref, delta, position) => {
                            storage.set("size", { width: ref.offsetWidth, height: ref.offsetHeight }, (err) => {
                                console.log(err)
                            })
                        }}

                        minWidth={40}
                        minHeight={20}
                        maxWidth={640}
                        maxHeight={360}
                        bounds="window"
                    >
                        <img className="image-example" height="100%" width="100%" src="assets/images/han.png" />
                    </Rnd>
                </div>
                <div className="output">
                    <InputLabel>Template</InputLabel>
                    <TextareaAutosize
                        rows={12}
                        rowsMax={12}
                        aria-label="Template"
                        value={templateString}
                        onChange={(e) => setTemplateString(e.target.value)}
                    />
                    <InputLabel>Output</InputLabel>
                    <div className="content-output">
                        <TextareaAutosize
                            rows={12}
                            rowsMax={12}
                            onClick={() => {
                                clipboard.writeText(cmdOutput)
                                setShowCopyText(true)
                                setTimeout(() => {
                                    setShowCopyText(false)
                                }, 1000);
                            }}
                            aria-label="Output"
                            value={cmdOutput}
                        />
                        {showCopyText && (<p className="copy-alert">Copy to clipboard!</p>)}
                    </div>
                </div>
            </div>
        </div>
    )
}