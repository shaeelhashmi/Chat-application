
interface item{
    id :number ,
    text:string,
    created_at: Date,

}
interface TextBoxProps {
    handleSubmit: (value: string) => void;
    element: item;
    buttonText:string
    buttonColor:string
    dateRepresentation?: string
}

export default function TextBox(props: TextBoxProps) {
  return (
   <div key={props.element.id } className="my-8 text-black grid grid-cols-2 justify-between bg-gray-300 p-4 rounded-lg shadow-md">
          <p className="text-start sm:text-base text-sm">{props.element.text}</p>
           <div className="justify-self-end">
              <button
                className={`${props.buttonColor} p-3 rounded-md justify-self-end my-3`}
                onClick={() => props.handleSubmit(props.element.text)}
              >
                {props.buttonText}
              </button>
            </div>
          <p className="text-start sm:text-sm text-xsm justify-self-end col-start-2">{props.dateRepresentation} {props.element.created_at.toLocaleString()}</p>
        </div>
  )
}
