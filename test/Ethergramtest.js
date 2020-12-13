const { assert } = require('chai')

const Ethergram = artifacts.require('Ethergram')

require('chai')
  .use(require('chai-as-promised'))
  .should()


contract('Ethergram', ([deployer, author, tipper]) => {
  let ethergram

  before(async () => {
    // Load Contracts
    ethergram = await Ethergram.new()
  })

  describe('Ethergram deployment', async () => {
    it('has a name', async () => {
      const name = await ethergram.name()
      assert.equal(name, 'Ethergram')
    })
    it('has an address', async () => {
      const address = await ethergram.address
      assert.notEqual(address, '0x0')
      assert.notEqual(address, '')
      assert.notEqual(address, null)
    })
  })
  describe('images', async()=>{
    let result, imageCount
    const hash = 'abc123'

    before(async () => {
      result = await ethergram.uploadImage(hash, 'Image description', { from: author })
      imageCount = await ethergram.imageCount()
    })

    it('creates images', async()=>{
      //success
      assert.equal(imageCount, 1)
      const event = result.logs[0].args 
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'hash is correct')
      assert.equal(event.description, 'Image description', 'description is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      //for the failure case we try to call upload image with invalid arguments
      await ethergram.uploadImage('', 'Image description', {from: author}).should.be.rejected
      await ethergram.uploadImage('hash', '', {from: author}).should.be.rejected
    })
    //we want to be able to fetch all the images
    it('lists images', async()=>{
      const image = await ethergram.images(imageCount)
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(image.hash, hash, 'hash is correct')
      assert.equal(image.description, 'Image description', 'description is correct')
      assert.equal(image.tipAmount, '0', 'tip amount is correct')
      assert.equal(image.author, author, 'amount is correct')
      console.log(image)
    })
    it('allows us to tip images', async()=>{
      //track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await ethergram.tipImageOwner(imageCount, {from: tipper, value: web3.utils.toWei('1', 'Ether')})

      //SUCCESS
      const event = result.logs[0].args 
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Image description', 'description is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip is correct')
      assert.equal(event.author, author, 'author is correct')

      //check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner = web3.utils.toWei('1', 'Ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedBalance = oldAuthorBalance.add(tipImageOwner)
      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())
      
      //Failure: tries to tip a image that does not exist
      await ethergram.tipImageOwner(99,{from:tipper,value:web3.utils.toWei('1', 'Ether')}).should.be.rejected
    })
  })
})