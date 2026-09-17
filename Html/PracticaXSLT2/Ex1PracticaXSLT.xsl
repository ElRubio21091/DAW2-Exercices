<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- 1) Retorna una llista amb els noms del departaments (Title) -->
  <xsl:template match="/Course_Catalog">
    <departments>
      <xsl:for-each select="Department">
        <Title><xsl:value-of select="Title"/></Title>
      </xsl:for-each>
    </departments>
  </xsl:template>
</xsl:stylesheet>