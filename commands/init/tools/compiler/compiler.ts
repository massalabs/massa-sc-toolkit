import asc from 'assemblyscript/dist/asc';

export async function compile(argv: string[], options: object = {}) {
    const { error, stdout, stderr } = await asc.main(argv, options);
    if (error) {
        console.log('Compilation failed: ' + error.message);
        console.log(stderr.toString());
    } else {
        console.log(stdout.toString());
    }
}