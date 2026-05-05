import React from 'react'

const CallPage =  async ({params}) => {
    const { id } = await params;
    console.log(id);
  return (
    <div>
        {`Call page for call id: ${id}`}
    </div>
  )
}

export default CallPage