import './Chat.css'
import React, {FC, useEffect, useRef} from 'react'
import {colors} from "../utils/colors"


type Fragment = {
    text: string,
    emoticon: {
        emoticon_id: string
    }
}

type ChatMessage = {
    _id: string,
    content_offset_seconds: number,
    commenter: {
        display_name: string
    },
    message: {
        body: string,
        user_color: string,
        fragments: Fragment[],
        user_badges: {
            _id: string,
            version: string
        }[],
    }
}

type Emote = {
    code: string
}

type ChatProps = {
    chatMessages: ChatMessage[],
    bttvEmotes: Emote[],
    resetFunction: Function
}

const Chat: FC<ChatProps> = ({chatMessages, bttvEmotes, resetFunction}) => {
    const predictionBlueUrl = "https://static-cdn.jtvnw.net/badges/v1/e33d8b46-f63b-4e67-996d-4a7dcec0ad33/1"
    const predictionPinkUrl = "https://static-cdn.jtvnw.net/badges/v1/4b76d5f2-91cc-4400-adf2-908a1e6cfd1e/1"
    const twitchStaffUrl = "https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8f57-4e4bef88af34/1"
    const moderatorUrl = "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1"
    const subscriberUrl = "https://static-cdn.jtvnw.net/badges/v1/5571b5a7-51ae-4ee4-a1b6-a25975c95dd7/1"

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({behavior: "auto"})
    }

    const placeChatOnMobile = () =>{
        //Makes sure as much as chat can be seen as possible on mobile.
        const videoContainer = document.querySelector(".player-container");
        const chatContainer = document.querySelector(".chat-container");
        let mobileBreakpoint = window.matchMedia("(max-width: 800px)");
        if(mobileBreakpoint.matches){
            chatContainer.style.height = `calc(100dvh - ${videoContainer.clientHeight}px)`;
        }else{
            chatContainer.style.height = `100dvh`;
        }
    }

    const formatTimestamp = (content_offset) => {
        const hours = Math.floor(content_offset / 3600) === 0 ? "" : Math.floor(content_offset / 3600) + ":"
        const minutes = Math.floor((content_offset / 60) % 60).toString().padStart(hours ? 2 : 1, "0")
        const seconds = Math.floor(content_offset % 60).toString().padStart(2, "0")
        return `${hours}${minutes}:${seconds} `
    }

    const formatFragment = (fragment, i) => {
        if (fragment.emoticon) {
            const emoticonId = fragment.emoticon.emoticon_id
            return <img
                key={(i.toString() + fragment.text).hashCode()}
                alt={fragment.text}
                className="emoticon"
                src={`https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/1.0`}
                srcSet={[
                    `https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/1.0 1x`,
                    `https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/2.0 2x`,
                    `https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/3.0 4x`
                ].join(",")}
            />
        }
        const words = fragment.text.split(" ")

        // Gathered from https://github.com/night/betterttv/blob/ad5247ee36e82f1aadd539175f706785ee6a4e8e/src/modules/chat/index.js#L26-L31
        const modifiers = {
            "w!": " modifier-wide",
            "v!": " modifier-vertical",
            "h!": " modifier-horizontal",
            "z!": " modifier-zero-space"
        };

        return <span key={i + "text"}>
            {words.map((word, j) => {
                const previousWord = words[j-1] ?? null
                const nextWord = words[j+1] ?? null

                // Don't display a modifier if it affects an emote
                if (modifiers[word] && bttvEmotes[nextWord]) {
                    return <></>
                }

                if (bttvEmotes[word]) {
                    const className = "emoticon" + (modifiers[previousWord] ?? "")

                    return <span key={`${i}-${j}-${word}-bttv`}>
                        <img
                            alt={word}
                            className={className}
                            src={`https://cdn.betterttv.net/emote/${bttvEmotes[word]}/1x`}
                            srcSet={[
                                `https://cdn.betterttv.net/emote/${bttvEmotes[word]}/1x 1x`,
                                `https://cdn.betterttv.net/emote/${bttvEmotes[word]}/2x 2x`,
                                `https://cdn.betterttv.net/emote/${bttvEmotes[word]}/3x 3x`
                            ].join(",")}
                        />
                        <span> </span>
                    </span>
                }
                return <span key={`${i}-${j}-${word}-normal`}>
                    {word + " "}
                </span>
            })}
        </span>
    }

    const getColor = function (commenterName) {
        let colorHash = Math.abs(commenterName.hashCode())
        return colors[colorHash % colors.length]
    }

    const hasBadge = function (message, badgeId, badgeVersion) {
        const badges = message.message.user_badges
        return badges && badges.some((badge) =>
            badge._id === badgeId && (!badgeVersion || badge.version === badgeVersion)
        )
    }

    const formatMessage = (message) => {
        // There are null commenter names in 873550274.json - twitch was having issues at the time
        const commenterName = message.commenter?.display_name || "UNKNOWN"
        // There are messages without fragments in 1075023215.json - no idea why. Emotes won't work properly for those messages.
        const fragments = message.message?.fragments || [{text: message.message.body}]
        return <>
            <span>{formatTimestamp(message.content_offset_seconds)}</span>
            {hasBadge(message, "predictions", "blue-1") && <><img alt="prediction-blue-1" src={predictionBlueUrl} className="badge"/><span> </span></>}
            {hasBadge(message, "predictions", "pink-2") && <><img alt="prediction-pink-2" src={predictionPinkUrl} className="badge"/><span> </span></>}
            {hasBadge(message, "staff") && <><img alt="twitch-staff" src={twitchStaffUrl} className="badge"/><span> </span></>}
            {hasBadge(message, "moderator") && <><img alt="moderator" src={moderatorUrl} className="badge"/><span> </span></>}
            {hasBadge(message, "subscriber") && <><img alt="subscriber" src={subscriberUrl} className="badge"/><span> </span></>}
            <span className="commenter" style={{color: getColor(commenterName)}}>{commenterName + ": "}</span>
            {fragments.map(formatFragment)}
        </>
    }

    useEffect(scrollToBottom, [chatMessages])
    useEffect(placeChatOnMobile)

    return <>
        <div className="resetButton" onClick={() =>resetFunction()}>X</div>
        <div>
            {chatMessages.map(message => (
                <p key={message._id} className="chatMessage">{formatMessage(message)}</p>
            ))}
            <div key={"messagesEnd"} ref={messagesEndRef}/>
        </div>
    </>
}

export default Chat
