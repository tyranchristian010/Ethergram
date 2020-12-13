pragma solidity 0.5.0;
contract Ethergram {
   string public name ="Ethergram"; 

   //store Images
   uint public imageCount = 0;
   mapping(uint => Image) public images;      // they key is a uint and the value is the actual Image struct which has an IPFS hash

   struct Image {
     uint id;
     string hash;
     string description;
     uint tipAmount;
     address payable author;
   }
   event ImageCreated(
     uint id,
     string hash,
     string description,
     uint tipAmount,
     address payable author
   );

   event ImageTipped(
     uint id,
     string hash,
     string description,
     uint tipAmount,
     address payable author
   );

   //create images and add them to the collection images mapping
   function uploadImage(string memory _imgHash, string memory _description) public {
     require(bytes(_imgHash).length>0);           //make sure the image exits
     require(bytes(_description).length>0);       //make sure description exists
     require(msg.sender != address(0x0));           //make sure uploader address exists

     //increment image id
     imageCount++;
     //add image to the images mapping
     images[imageCount]= Image(imageCount, _imgHash, _description, 0, msg.sender);
     //Trigger an event
     emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
   }

   function tipImageOwner(uint _id) public payable {
     //make sure the id is valid
     require(_id > 0 && _id <= imageCount); //the imageCount can never be 0 or 10.
     
     //1st fetch the image from the images mapping and make sure you include the type Image
     Image memory _image = images[_id];
     
     //2nd fetch the author address from the Image struct and set it to a variable
     address payable _author = _image.author;
     
     //transfer the money to the author
     address(_author).transfer(msg.value);
     
     //dont forget to update the tip amount
     _image.tipAmount=_image.tipAmount+msg.value;
     
     //dont forget to put the image back in the mapping
     images[_id] = _image;
     
     //Trigger an event that indicates that an author has been tipped
     emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
   }
}

