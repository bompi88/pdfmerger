package no.laererportalen.pdfmerger;

import java.util.List;
import java.util.ArrayList;

import com.beust.jcommander.Parameter;

/**
 * CommandInput - JCommander class for interperation of commandline inputs.
 *
 */
public class CommandInput {

  @Parameter(names={"--output", "-o"}, description = "Path to the output file. (Optional, default is stdout)")
  String outputPath;

  @Parameter(names={"--source", "-s"}, description = "Sets a source, use it multiple times to set multiple sources. If only a single source is set, the application will assume that it's a directory containing pdf-files, and merge all files in that directory, in alphabetical order.")
  List<String> sources = new ArrayList<String>();

}
