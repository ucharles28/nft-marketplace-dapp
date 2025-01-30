// import { create } from "ipfs-http-client"

// const projectId = "5003006e14834228836ff7c10f5f3bbe"
// const projectSecret = "bwcB0nB3LUK7Dg2A2N20T0SiAtxEWN89v4Z36Oan2rfRu+hracZqog"
// const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

// // const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
// const client = create({
//     host: 'ipfs.infura.io',
//     port: 5001,
//     protocol: 'https',
//     headers: {
//         authorization: auth,
//     }
// })

import { create } from '@web3-storage/w3up-client'
const client = await create()

await client.setCurrentSpace('did:key:z6MkgSXXaPBwjdAi1uWL1azvSzBCUeVkLgf17L3q5juCd6q1')

function convertFormDataEntryToFile(entry: FormDataEntryValue): File {
    if (entry instanceof File) {
        return entry; // Already a File
    } else if (typeof entry === 'string') {
        // Convert the string to a Blob and then a File
        const blob = new Blob([entry], { type: 'text/plain' });
        return new File([blob], 'default.txt', { type: 'text/plain' });
    } else {
        throw new Error('Unsupported FormDataEntryValue type');
    }
}

export async function POST(request: Request) {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file){return;}
    let url = ''
    let directoryCid;
    try {
        directoryCid = await client.uploadFile(convertFormDataEntryToFile(file))
        console.log(directoryCid)
    } catch (error) {
        console.log('Error uploading file: ', error)
    }
    return Response.json({ url: directoryCid })
  }