package no.laererportalen.pdfmerger;

import java.io.File;
import java.io.PrintStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.FilenameFilter;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;

import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collections;

import no.laererportalen.pdfmerger.CommandInput;
import no.laererportalen.pdfmerger.AlphanumComparator;

import com.beust.jcommander.JCommander;

import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.multipdf.PDFMergerUtility;

/**
 * PDFMerger - Utility that uses PDFBox to combine PDF-files into a single PDF.
 *
 */
public class PDF {

  private PDFMergerUtility pdfboxMerger;
  private final AlphanumComparator anc = new AlphanumComparator();

  public PDF() {
    pdfboxMerger = new PDFMergerUtility();
  }

  public static void main(String[] args) {

    System.setProperty("apple.awt.UIElement", "true");

    PDF pdfMerger = new PDF();
    CommandInput cmdInput = new CommandInput();
    JCommander jc = new JCommander(cmdInput, args);

    int numOfSources = cmdInput.sources.size();

    if (numOfSources == 0) {
      System.err.println("Error: No sources provided");
      jc.usage();
      System.exit(1);
    } else if (numOfSources == 1) {
      File directory = new File(cmdInput.sources.get(0));
      pdfMerger.addSource(directory);
    } else {
      List<File> files = new ArrayList<File>(numOfSources);
      for (String path : cmdInput.sources) {
        files.add(new File(path));
      }

      pdfMerger.addSource(files);
    }

    if (cmdInput.outputPath != null && !cmdInput.outputPath.isEmpty()) {
      try {
        OutputStream out = new FileOutputStream(cmdInput.outputPath);
        pdfMerger.setOutputStream(out);
      } catch(FileNotFoundException e) {
        System.err.println("Error: Output file path not accessible: " + cmdInput.outputPath);
        System.exit(1);
      }
    } else {
      pdfMerger.setOutputStream(System.out);
    }
    pdfMerger.merge();
  }

  public void setOutputStream(OutputStream stream) {
    pdfboxMerger.setDestinationStream(stream);
  }

  public PDF merge() {
    try {
      pdfboxMerger.mergeDocuments(MemoryUsageSetting.setupMainMemoryOnly());
    } catch(IOException e) {
      System.err.println("Error: Could not merge documents: " + e);
      System.exit(1);
    }
    return this;
  }

  public PDF setDestinationFile(String file) {
    pdfboxMerger.setDestinationFileName(file);
    return this;
  }

  public List<File> getPdfFilesInDirectory(final File directory) {
    if (!directory.isDirectory()) {
      System.err.println("Error: The provided directory path is not a directory: " + directory.getPath());
      System.exit(1);
    }

    return Arrays.asList(directory.listFiles(new FilenameFilter() {
      public boolean accept(File dir, String filename) {
        return filename.endsWith(".pdf");
      }
    }));
  }

  public PDF addSource(final List<File> files) {

    if (files.size() < 2) {
      System.err.println("Error: Missing sources. It should be provided at least two pdf sources, or a directory that contain at least two pdf files. ATM this module checks only the extension and do not try to determine the mime-type, so make sure the filenames contain .pdf and that it is indeed a pdf file.");
      System.exit(1);
    }

    for (File file : files) {
      try {
        pdfboxMerger.addSource(file);
      } catch(FileNotFoundException e) {
        System.err.println("Error: File not found or accessible: " + file.getPath());
        System.exit(1);
      }
    }

    return this;
  }

  public PDF addSource(final File directory) {
    List<File> files = getPdfFilesInDirectory(directory);

    Collections.sort(files,  new Comparator<File>() {
      @Override
      public int compare(File o1, File o2) {
        return anc.compare(o1.getName(), o2.getName());
      }
    });

    addSource(files);
    return this;
  }
}
