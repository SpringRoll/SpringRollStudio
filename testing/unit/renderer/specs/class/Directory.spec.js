import Directory from '../../../../../src/renderer/class/Directory';
import { EventBus } from '@/renderer/class/EventBus';
import { files, addFile } from '../../utils/data';


describe('Directory.js', () => {

  it('if constructed with initial files it should sort them alphabetically', () => {
    const directory = new Directory({
      files
    });

    expect(directory.files[0].name).to.equal('acoustic-guitar.mp3');
    expect(directory.files[1].name).to.equal('title.mp3');
  });

  it('addFile()', () => {
    const directory = new Directory();

    directory.addFile(addFile);
    //addFile() will build out any additional directories required based on the relative path of the file.
    expect(directory.files.length).to.equal(0);
    expect(directory.dir.path.dir.to.files.length).to.equal(1);
  });

  it('selectByIndex', () => {
    const directory = new Directory({
      files
    });

    const file = directory.selectByIndex(0);
    expect(file.name).to.equal('acoustic-guitar.mp3');
    expect(directory.currentFile().name).to.equal('acoustic-guitar.mp3');

  });
  it('selectByFile', () => {
    const fileToSelect = files[0];
    const directory = new Directory({
      files
    });

    const returnedFile = directory.selectByFile(fileToSelect);
    expect(returnedFile.name).to.equal(files[0].name);
    expect(directory.currentFile().name).to.equal(files[0].name);
  });

  it('switching files should return the new file and update the current file to match', () => {
    const directory = new Directory({
      files
    });

    //sets currentfile to first file alphabetically
    expect(directory.currentFile().name).to.equal(files[1].name);

    const nextFile = directory.nextFile();
    expect(nextFile.name).to.equal(files[0].name);
    expect(directory.currentFile().name).to.equal(files[0].name);

    const prevFile = directory.previousFile();
    expect(prevFile.name).to.equal(files[1].name);
    expect(directory.currentFile().name).to.equal(files[1].name);

  });
});