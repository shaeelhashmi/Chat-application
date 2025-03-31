
export default function MessageBody() {

const messages = [
  { text: "Hello, how are you?", sender: "receiver" },
  { text: "I'm good, thanks! How about you?", sender: "sender" },
  { text: "I'm doing well, thanks for asking.", sender: "receiver" },
  { text: "Hey! I'm good too, just working on some projects.", sender: "sender" },
  { text: "I'm working on a chat application using React and TypeScript.", sender: "receiver" },
  { text: "That's great to hear! What projects are you working on?", sender: "sender" },
  { text: "Hello, how are you?", sender: "receiver" },
  { text: "I'm good, thanks! How about you?", sender: "sender" },
];
  return (
    < >
    <div className=" h-full   mt-20 p-2 ml-[3%]">
      {messages.map((message, index) => (
        <div key={index} className={`flex  mb-4 ${message.sender=="sender"?"justify-end":""}`}>
          <div className={`bg-[#141474] text-white p-4 rounded-lg w-[50%] `}>{message.text}</div>
        </div>
      ))}
     <div>
      <div className="fixed bottom-0 w-[75%]">
        <textarea
          className="border border-gray-300 w-full p-3 resize-none "
          placeholder="Type a message..."
        />
      </div>
      </div>
  
    </div>
    
    </>
  )
}
