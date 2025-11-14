// import { createContext, useContext, useEffect, useState } from "react";
// import { AuthContext } from "./AuthContext";
// import toast from "react-hot-toast";


// export const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//     const [messages, setMessages] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null)
//     const [unseenMessages, setUnseenMessages] = useState({})

//     const { socket, axios } = useContext(AuthContext);

//     //function to get all users for sidebar
//     const getUsers = async () => {
//         try {
//             const { data } = await axios.get("/api/messages/users");
//             if (data.success) {
//                 setUsers(data.users)
//                 setUnseenMessages(data.unseenMessages)
//             }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }

//     //function to get messages for selected user
//     const getMessages = async (userId) => {
//         try {
//             const { data } = await axios.get(`/api/messages/${userId}`);
//             if (data.success) {
//                 setMessages(data.messages)
//             }
//         } catch (error) {
//             toast.error(error.message)

//         }
//     }

//     //function to send message to selected user
//     const sendMessage = async (messageData) => {
//         try {
//             const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
//             if (data.success) {
//                 setMessages((prevMessages) => [...prevMessages, data.newMessage])
//             } else {
//                 toast.error(data.message);
//             }
//         } catch (error) {
//             toast.error(data.message);
//         }
//     }

//     //function to subscribe to messages for selected user
//     const subscribeToMessages = async () => {

//         if (!socket) {
//             console.log("Socket not initiliazed");
//             return
//         }

//         socket.on("newMessages", (newMessage) => {
//             if (selectedUser && newMessage.senderId === selectedUser._id) {
//                 newMessage.seen = true;
//                 setMessages((prevMessages) => [...prevMessages, newMessage])
//                 axios.put(`/api/messages/mark/${newMessage._id}`);
//             } else {
//                 setUnseenMessages((prevUnseenMessages) => ({
//                     ...prevUnseenMessages, [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
//                 }))
//             }
//         })
//     }

//     //function to unsubscribe from messages
//     const unsubscribeFromMessages = () => {
//         if (socket) socket.off("newMessage");
//     }

//     useEffect(() => {
//         subscribeToMessages();
//         return () => unsubscribeFromMessages();
//     }, [socket, selectedUser])



//     const value = {
//         messages, users, selectedUser, getUsers, setMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
//     }

//     return (
//         <ChatContext.Provider value={value}>
//             {children}
//         </ChatContext.Provider>)
// }


import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // Fetch all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            console.log("Fetched users:", data);
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            console.log("Get Messages clicked");
            console.log("Get Messages clicked for:", userId);

            if (data.success) {
                setMessages(data.messages);
                console.log("Messages received:", data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Send message to selected user
    // const sendMessage = async (messageData) => {
    //     try {
    //         const { data } = await axios.post(
    //             `/api/messages/send/${selectedUser._id}`,
    //             messageData
    //         );
    //         if (data.success) {
    //             setMessages((prevMessages) => [...prevMessages, data.newMessage]);
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // };

    const sendMessage = async (messageData) => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Subscribe to incoming messages
    useEffect(() => {
        if (!socket || !selectedUser) return;

        const handleNewMessage = (newMessage) => {
            if (newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: prev[newMessage.senderId]
                        ? prev[newMessage.senderId] + 1
                        : 1,
                }));
            }
        };

        socket.on("newMessages", handleNewMessage);

        return () => {
            socket.off("newMessages", handleNewMessage);
        };
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};