export async function getSegment(){
try{
    let segment = ''
    segment =(await import("oicq")).segment
    }catch(err){
    segment =(await import("icqq")).segment
    }
    return segment
}